import { useNavigate } from 'react-router';
import { Info } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { ItemsWearList } from '@/modules/items/components/ItemsWearList';
import { useCharacter } from '@/hooks/useCharacter';

export const CharacterInventoryWearList: FC = () => {
  const { character } = useCharacter();
  const navigate = useNavigate();

  const handleClick = (wear: string) => {
    navigate(`/character/inventory/${wear}`);
  };

  const getEquippedItem = (wear: string) => {
    return character.inventory.find((item) => item.wear === wear && item.putOn)?.item.info.name;
  };

  return (
    <ItemsWearList
      onClick={handleClick}
      after={(wear) => <Info type="text">{getEquippedItem(wear)}</Info>}
    />
  );
};
