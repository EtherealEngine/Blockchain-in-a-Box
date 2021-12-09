import { HttpAgent, Actor, ActorSubclass } from "@dfinity/agent";

import { PlugIdentity } from "../identity";
import { signFactory } from "./sign";

export interface CreateAgentParams {
  whitelist?: string[];
  host?: string;
}

interface CreateAgentParamsFixed {
  whitelist: string[];
  host: string;
}

const DEFAULT_HOST = "https://mainnet.dfinity.network";
/* eslint-disable @typescript-eslint/no-unused-vars */
const DEFAULT_CREATE_AGENT_ARGS: CreateAgentParamsFixed = {
  whitelist: [],
  host: DEFAULT_HOST,
};

export const createAgent = async (
  clientRPC,
  metadata,
  {
    whitelist = DEFAULT_CREATE_AGENT_ARGS.whitelist,
    host = DEFAULT_CREATE_AGENT_ARGS.host,
  }: CreateAgentParams,
  idls,
  preApprove = false
) => {
  const publicKey = await clientRPC.call("verifyWhitelist", [metadata, whitelist], {
      timeout: 0,
      target: "",
    },
  );

  const identity = new PlugIdentity(
    publicKey,
    signFactory(clientRPC, idls, preApprove),
    whitelist
  );

  return new HttpAgent({
    identity,
    host,
  });
};

export const createActor = async <T>(
  agent,
  canisterId,
  interfaceFactory
): Promise<ActorSubclass<T>> => {
  return Actor.createActor(interfaceFactory, {
    agent: agent,
    canisterId,
  });
};
