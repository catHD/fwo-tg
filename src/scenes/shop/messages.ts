import _ from 'lodash';
import arena from '../../arena';
import type { CharacterService } from '../../arena/CharacterService';
import { itemDescription } from '../../arena/ItemService';
import { stores } from '../../arena/MiscService';

export const enter = (): string => 'Список категорий товаров';

export const itemType = (type: string): string => `${stores[type]}`;

export const itemInfo = (code: string, char: CharacterService): string => {
  const item = arena.items[code];
  return itemDescription(char, item);
};

export const buy = (code: string, char: CharacterService): string => {
  const item = arena.items[code];
  return `Ты купил предмет ${item.info.name}. У тебя осталось 💰 ${char.gold}`;
};

export const noGold = (): string => 'Недостаточно голды';

