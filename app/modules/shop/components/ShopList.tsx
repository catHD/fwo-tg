import type { Item } from '@fwo/schemas';
import { ButtonCell, Navigation, Placeholder } from '@telegram-apps/telegram-ui';
import { useState, type FC } from 'react';
import { ShopItemModal } from './ShopItemModal';
import { buyItem } from '@/client/character';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { popup } from '@telegram-apps/sdk-react';

export const ShopList: FC<{ shopPromise: Promise<Item[]> }> = ({ shopPromise }) => {
  const [items, setItems] = useState<Item[]>([]);
  const { updateCharacter } = useUpdateCharacter();

  const handleBuy = async (item: Item) => {
    try {
      await buyItem(item.code);
      await updateCharacter();
    } catch (e) {
      popup.open(e);
    }
  };

  shopPromise.then(setItems);

  if (!items.length) {
    throw shopPromise;
  }

  return items.length ? (
    <>
      {items.map((item) => (
        <ShopItemModal
          key={item.code}
          item={item}
          onBuy={handleBuy}
          trigger={
            <ButtonCell>
              <Navigation>{item.info.name}</Navigation>
            </ButtonCell>
          }
        />
      ))}
    </>
  ) : (
    <Placeholder description="Ничего не найдено" />
  );
};
