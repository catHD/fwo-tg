import { useCharacterContext } from './useCharacterContext';

export const useCharacter = () => {
  const { character, setCharacter } = useCharacterContext();

  if (!character) {
    throw new Error('character must be within ProtectedRoute');
  }

  return {
    setCharacter,
    character,
  };
};
