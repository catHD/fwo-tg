import { client } from '@/client';
import type { CharacterAttributes, CreateCharacterDto } from '@fwo/schemas';

export const getCharacter = async () => {
  return client.character
    .$get()
    .then((r) => {
      if (r.ok) {
        return r.json();
      }
    })
    .catch(console.log);
};

export const createCharacter = async (json: CreateCharacterDto) => {
  return client.character
    .$post({ json })
    .then((r) => r.json())
    .catch(console.log);
};

export const changeCharacterAttributes = async (body: CharacterAttributes) => {
  return client.character.attributes
    .$patch({ json: body })
    .then((r) => r.json())
    .catch(console.log);
};

export const deleteCharacter = async () => {
  return client.character.$delete().catch(console.log);
};
