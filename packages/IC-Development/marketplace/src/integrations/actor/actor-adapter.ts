import { ENV, Errors } from '@/config';
import { ActorRepository, AppActors } from '.';
import type { Provider } from '../../lib/plug-inpage-provider';
import type { IDL } from '@dfinity/candid';

export class ActorAdapter implements ActorRepository {
  constructor(private plugProvider?: Provider) {
    if (!plugProvider) {
      throw new Error(Errors.PlugNotConnected);
    }
  }

  async createActor<T extends AppActors>(
    canisterId: string,
    interfaceFactory: IDL.InterfaceFactory
  ): Promise<T> {
    await this.createAgent();
    return this.plugProvider.createActor<T>({
      canisterId,
      interfaceFactory,
    } as any);
  }

  private async createAgent(): Promise<any> {
    if (!this.plugProvider.agent) {
      await this.plugProvider.createAgent({
        whitelist: [ENV.nftCanisterId],
        host: ENV.apiURL,
      });

      if (ENV.isDev) {
        this.plugProvider.agent.fetchRootKey();
      }
    }
  }
}
