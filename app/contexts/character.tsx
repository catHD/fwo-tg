import type { Character } from '@fwo/schemas';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { createContext, use, useState } from 'react';

export type CharacterContextType = {
  character: Character | undefined;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
};

export const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider = ({
  children,
  characterPromise,
}: PropsWithChildren<{ characterPromise: Promise<Character | undefined> }>) => {
  const [character, setCharacter] = useState(use(characterPromise) ?? undefined);

  return <CharacterContext value={{ character, setCharacter }}>{children}</CharacterContext>;
};
