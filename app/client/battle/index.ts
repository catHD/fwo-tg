import { client } from '@/client';

export const getBattleWebSocket = () => {
  return client.battle.$ws();
};
