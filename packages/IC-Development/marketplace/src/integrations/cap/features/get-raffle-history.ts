import { ENV } from '@/config';
import { CapHistoryLog } from '@/models';
import { getCapRootInstance } from '../connection';

export const getRaffleHistory = async (): Promise<CapHistoryLog[]> => {
  const capRoot = await getCapRootInstance({
    canisterId: ENV.capRaffleCanisterId,
  });
  const size = await capRoot.size();

  const result = (await capRoot.get_transactions({
    page: Math.floor(Number(size) / 64),
  })) as { data: CapHistoryLog[] };

  return result.data.sort((a, b) => Number(b.time) - Number(a.time));
};
