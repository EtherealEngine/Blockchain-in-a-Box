import BrowserRPC from "@fleekhq/browser-rpc/dist/BrowserRPC";
import { Agent, HttpAgent, Actor, ActorSubclass } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";

import getDomainMetadata from "./utils/domain-metadata";
import {
  managementCanisterIdlFactory,
  managementCanisterPrincipal,
  transformOverrideHandler,
} from "./utils/ic-management-api";
import { versions } from "./constants";
import {
  getArgTypes,
  ArgsTypesOfCanister,
  getSignInfoFromTransaction,
} from "./utils/sign";
import { createActor, createAgent, CreateAgentParams } from "./utils/agent";
import { recursiveParseBigint } from "./utils/bigint";

export interface Transaction<
  SuccessReturn = unknown,
  FailReturn = unknown,
  SuccessResponse = unknown,
  FailResponse = unknown
> {
  idl: IDL.InterfaceFactory;
  canisterId: string;
  methodName: string;
  args: any[];
  onSuccess: (res: SuccessResponse) => Promise<SuccessReturn>;
  onFail: (res: FailResponse) => Promise<FailReturn>;
}

export interface RequestConnectInput {
  canisters?: Principal[];
  timeout?: number;
}

export interface TimeStamp {
  timestamp_nanos: bigint;
}

export interface SendOpts {
  fee?: bigint;
  memo?: bigint;
  from_subaccount?: number;
  created_at_time?: TimeStamp;
}

// The amount in e8s (ICPs)
interface RequestTransferParams {
  to: string;
  amount: bigint;
  opts?: SendOpts;
}

interface CreateActor<T> {
  agent: HttpAgent;
  actor: ActorSubclass<ActorSubclass<T>>;
  canisterId: string;
  interfaceFactory: IDL.InterfaceFactory;
}

interface RequestBurnXTCParams {
  to: string;
  amount: bigint;
}

interface RequestConnectParams extends CreateAgentParams {
  timeout?: number;
}

export interface ProviderInterfaceVersions {
  provider: string;
  extension: string;
}

export interface ProviderInterface {
  isConnected(): Promise<boolean>;
  disconnect(): Promise<void>;
  batchTransactions(transactions: Transaction[]): Promise<boolean>;
  requestBalance(accountId?: number): Promise<bigint>;
  requestTransfer(params: RequestTransferParams): Promise<bigint>;
  requestConnect(params: RequestConnectParams): Promise<any>;
  createActor<T>({
    canisterId,
    interfaceFactory,
  }: CreateActor<T>): Promise<ActorSubclass<T>>;
  agent: Agent | null;
  createAgent(params: CreateAgentParams): Promise<boolean>;
  requestBurnXTC(params: RequestBurnXTCParams): Promise<any>;
  versions: ProviderInterfaceVersions;
  getPrincipal: () => Promise<Principal>;
}

export default class Provider implements ProviderInterface {
  public agent: Agent | null;
  public versions: ProviderInterfaceVersions;
  // @ts-ignore
  public principal: Principal;
  private clientRPC: BrowserRPC;
  private idls: ArgsTypesOfCanister = {};

  constructor(clientRPC: BrowserRPC) {
    this.clientRPC = clientRPC;
    this.clientRPC.start();
    this.agent = null;
    this.versions = versions;
  }

  private async callClientRPC({ handler, args, config }): Promise<any> {
    const metadata = getDomainMetadata();

    const handleCallSuccess = (result) => {
      return result;
    };

    const handleCallFailure = async (error) => {
      const params = error.message;

      if (error.message === "Request Timeout") {
        return await this.clientRPC.call("handleTimeout", [metadata, params], {
          timeout: 0,
          target: "",
        });
      }

      return await this.clientRPC.call("handleError", [metadata, params], {
        timeout: 0,
        target: "",
      });
    };

    return this.clientRPC
      .call(handler, args, config)
      .then(handleCallSuccess, handleCallFailure);
  }

  public deleteAgent() {
    this.agent = null;
    return;
  }

  public async createActor<T>({
    canisterId,
    interfaceFactory,
  }: CreateActor<T>): Promise<ActorSubclass<T>> {
    const metadata = getDomainMetadata();
    this.idls[canisterId] = getArgTypes(interfaceFactory);
    if (!this.agent) {
      await createAgent(
        this.clientRPC,
        metadata,
        { whitelist: [canisterId] },
        this.idls
      );
    }
    return createActor<T>(this.agent, canisterId, interfaceFactory);
  }

  // Todo: Add whole getPrincipal flow on main plug repo in case this has been deleted.
  public async getPrincipal(): Promise<Principal> {
    const metadata = getDomainMetadata();
    if (this.principal) {
      return this.principal;
    } else {
      const response = await this.callClientRPC({
        handler: "getPrincipal",
        args: [metadata.url],
        config: {
          timeout: 0,
          target: "",
        },
      });

      if (response && typeof response === "string") {
        return Principal.from(response);
      }

      return response;
    }
  }

  public async isConnected(): Promise<boolean> {
    const metadata = getDomainMetadata();

    return await this.callClientRPC({
      handler: "isConnected",
      args: [metadata.url],
      config: {
        timeout: 0,
        target: "",
      },
    });
  }

  public async disconnect(): Promise<void> {
    const metadata = getDomainMetadata();

    await this.callClientRPC({
      handler: "disconnect",
      args: [metadata.url],
      config: {
        timeout: 0,
        target: "",
      },
    });
  }

  public async requestConnect(args: RequestConnectParams = {}): Promise<any> {
    const { whitelist = [], host, timeout = 120000 } = args;
    const metadata = getDomainMetadata();

    const publicKey = await this.callClientRPC({
      handler: "requestConnect",
      args: [metadata, whitelist, timeout],
      config: {
        timeout: 0,
        target: "",
      },
    });

    if (!whitelist || !Array.isArray(whitelist) || !whitelist.length)
      return publicKey;
    this.agent = await createAgent(
      this.clientRPC,
      metadata,
      { whitelist, host },
      this.idls
    );

    this.principal = await this.agent.getPrincipal();

    return publicKey;
  }

  public async createAgent({
    whitelist,
    host,
  }: CreateAgentParams = {}): Promise<any> {
    const metadata = getDomainMetadata();

    this.agent = await createAgent(
      this.clientRPC,
      metadata,
      { whitelist, host },
      this.idls
    );

    return !!this.agent;
  }

  public async requestBalance(accountId = 0): Promise<bigint> {
    const metadata = getDomainMetadata();

    return await this.callClientRPC({
      handler: "requestBalance",
      args: [metadata, accountId],
      config: {
        timeout: 0,
        target: "",
      },
    });
  }

  public async requestTransfer(params: RequestTransferParams): Promise<bigint> {
    const metadata = getDomainMetadata();

    return await this.callClientRPC({
      handler: "requestTransfer",
      args: [metadata, params],
      config: {
        timeout: 0,
        target: "",
      },
    });
  }

  public async batchTransactions(
    transactions: Transaction[]
  ): Promise<boolean> {
    const metadata = getDomainMetadata();

    const canisterList = transactions.map(
      (transaction) => transaction.canisterId
    );
    const agent = await createAgent(
      this.clientRPC,
      metadata,
      {
        whitelist: canisterList,
      },
      this.idls,
      true
    );

    const sender = (await agent.getPrincipal()).toString();

    const signInfo = transactions.map((trx) =>
      recursiveParseBigint(getSignInfoFromTransaction(trx, sender))
    );

    const batchAccepted = await this.callClientRPC({
      handler: "batchTransactions",
      args: [metadata, signInfo],
      config: {
        timeout: 0,
        target: "",
      },
    });

    if (!batchAccepted) return false;

    for (const transaction of transactions) {
      const actor = await createActor(
        agent,
        transaction.canisterId,
        transaction.idl
      );
      const method = actor[transaction.methodName];
      try {
        const response = await method(...transaction.args);
        if (transaction?.onSuccess) {
          await transaction?.onSuccess(response);
        }
      } catch (error) {
        if (transaction?.onFail) {
          await transaction.onFail(error);
        }
        break;
      }
    }

    return true;
  }

  public async requestBurnXTC(params: RequestBurnXTCParams): Promise<any> {
    const metadata = getDomainMetadata();

    return await this.callClientRPC({
      handler: "requestBurnXTC",
      args: [metadata, params],
      config: {
        timeout: 0,
        target: "",
      },
    });
  }

  public async getManagementCanister() {
    if (!this.agent) {
      throw Error("Oops! Agent initialization required.");
    }

    return Actor.createActor(managementCanisterIdlFactory, {
      agent: this.agent,
      canisterId: managementCanisterPrincipal,
      ...{
        callTransform: transformOverrideHandler,
        queryTransform: transformOverrideHandler,
      },
    });
  }
}
