import { use } from 'react';
import { CharacterContext } from '@/contexts/character';

export const useCharacterContext = () => {
  const context = use(CharacterContext);

  if (!context) {
    throw new Error('characterContext must be within CharacterContext');
  }

  return context;
};
