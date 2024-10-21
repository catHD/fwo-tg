import { client } from '@/app/client';
import type { CharacterAttributes, CreateCharacterDto } from '@/schemas/character';

export const loadCharacter = async () => {
  return client.character.$get()
    .then((r) => r.json())
    .catch(console.log);
};

export const createCharacter = async (json: CreateCharacterDto) => {
  return client.character.$post({ json })
    .then((r) => r.json())
    .catch(console.log);
};

export const changeCharacterAttributes = async (body: CharacterAttributes) => {
  return client.character.attributes.$patch({ json: body })
    .then((r) => r.json())
    .catch(console.log);
};
