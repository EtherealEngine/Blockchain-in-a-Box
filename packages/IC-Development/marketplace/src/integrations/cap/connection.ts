import { ENV } from '@/config';
import { CapRoot } from '../../cap/index';

export interface CapRouterInstanceProps {
  canisterId: string;
  host?: string;
}

export const getCapRootInstance = async ({
  canisterId,
  host = ENV.apiURL,
}: CapRouterInstanceProps) =>
  await CapRoot.init({
    host,
    canisterId,
  });
