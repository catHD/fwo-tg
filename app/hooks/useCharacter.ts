import { useContext } from 'react';
import { CharacterContext } from '@/contexts/character';

export const useCharacter = () => {
  const { character } = useContext(CharacterContext);

  return {
    character,
  };
};