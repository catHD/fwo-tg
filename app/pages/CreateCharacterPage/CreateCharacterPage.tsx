import type { CreateCharacterDto } from '@fwo/schemas';
import { Navigate } from 'react-router';
import { createCharacter } from '@/client/character';
import { SelectCharacter } from '@/components/SelectCharacter/SelectCharacter';
import { useCharacterContext } from '@/hooks/useCharacterContext';

export const CreateCharacterPage = () => {
  const { character, setCharacter } = useCharacterContext();

  const onSelect = async (createCharacterDto: CreateCharacterDto) => {
    const character = await createCharacter(createCharacterDto);
    if (character) {
      setCharacter(character);
    }
  };

  if (character) {
    return <Navigate to="/character" />;
  }

  return <SelectCharacter onSelect={onSelect} />;
};
