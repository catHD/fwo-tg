import { client } from '@/client';

export const getAvailableMagicList = () => {
  return client.magic.available
    .$get()
    .then((r) => r.json())
    .catch(console.log);
};

export const getMagicList = async (ids: string[]) => {
  return client.magic
    .$get({ query: { ids } })
    .then((r) => r.json())
    .catch(console.log);
};

export const getMagic = async (id: string) => {
  return client.magic[':id']
    .$get({ param: { id } })
    .then((r) => r.json())
    .catch(console.log);
};

export const learnMagic = async (lvl: number) => {
  return client.magic[':lvl']
    .$patch({ param: { lvl: lvl.toString() } })
    .then((r) => r.json())
    .catch(console.log);
};
