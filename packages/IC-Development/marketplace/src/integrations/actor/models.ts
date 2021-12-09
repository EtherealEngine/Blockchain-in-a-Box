import { NFTIDL } from '@/idls';
import type { IDL } from '@dfinity/candid';

export type NFTActor = NFTIDL.Erc721TokenFactory;
export type AppActors = NFTActor;

export interface ActorRepository {
  createActor: <T extends AppActors>(
    canisterId: string,
    interfaceFactory: IDL.InterfaceFactory
  ) => Promise<T>;
}

export type ActorProps = {
  canisterId: string;
  interfaceFactory: IDL.InterfaceFactory;
};
