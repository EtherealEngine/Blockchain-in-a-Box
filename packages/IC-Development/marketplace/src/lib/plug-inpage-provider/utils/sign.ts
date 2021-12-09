import { IDL, JsonValue } from "@dfinity/candid";
import { Buffer } from "buffer/";
import { Transaction } from "../Provider";
import { recursiveParseBigint } from "./bigint";
import getDomainMetadata from "./domain-metadata";

export interface SignInfo {
  methodName?: string;
  requestType?: string;
  canisterId?: string;
  sender?: string;
  arguments?: Buffer;
  decodedArguments?: JsonValue;
  manual: boolean;
}

export interface AssuredSignInfo {
  methodName: string;
  requestType: string;
  canisterId: string;
  sender: string;
  arguments: Buffer;
  decodedArguments?: JsonValue;
  manual: boolean;
  preApprove: boolean;
}

export type ArgsTypesOfCanister = { [key: string]: { [key: string]: any } };

export const canDecodeArgs = (
  signInfo: SignInfo | undefined,
  argsTypes: ArgsTypesOfCanister
): boolean => {
  return !!(
    signInfo?.canisterId &&
    signInfo?.methodName &&
    signInfo?.arguments &&
    argsTypes[signInfo.canisterId]?.[signInfo.methodName]
  );
};

export const getSignInfoFromTransaction = (
  transaction: Transaction,
  sender: string
): AssuredSignInfo => ({
  methodName: transaction.methodName,
  canisterId: transaction.canisterId,
  sender,
  arguments: Buffer.from([]),
  decodedArguments: transaction.args,
  manual: false,
  preApprove: false,
  requestType: "unknown",
});

const decodeArgs = (signInfo: SignInfo, argsTypes: ArgsTypesOfCanister) => {
  if (canDecodeArgs(signInfo, argsTypes)) {
    const assuredSignInfo = signInfo as AssuredSignInfo;
    const funArgumentsTypes =
      argsTypes[assuredSignInfo.canisterId][assuredSignInfo.methodName];
    return IDL.decode(funArgumentsTypes, assuredSignInfo.arguments);
  }
};

export const signFactory =
  (clientRPC, argsTypes: ArgsTypesOfCanister, preApprove: boolean = false) =>
  async (payload: ArrayBuffer, signInfo?: SignInfo): Promise<ArrayBuffer> => {
    const metadata = getDomainMetadata();
    const payloadArr = new Uint8Array(payload);

    if (signInfo) signInfo.decodedArguments = recursiveParseBigint(decodeArgs(signInfo, argsTypes));

    const res = await clientRPC.call(
      "requestSign",
      [payloadArr, metadata, { ...signInfo, preApprove }],
      {
        timeout: 0,
        target: "",
      }
    );
    return new Uint8Array(Object.values(res));
  };

export const getArgTypes = (interfaceFactory: IDL.InterfaceFactory) => {
  const service = interfaceFactory({ IDL });
  const methodArgType = {};
  service._fields.forEach(
    ([methodName, fun]) => (methodArgType[methodName] = fun.argTypes)
  );
  return methodArgType;
};
