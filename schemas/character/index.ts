import type { ItemAttributes } from '@/item/itemAttributesSchema';
import type { CharacterAttributes } from './characterAttributesSchema';
import { CharacterClass } from './characterClassSchema';

export const characterAttributesByClass: Record<CharacterClass, CharacterAttributes> = {
  [CharacterClass.Warrior]: {
    str: 10,
    dex: 8,
    int: 3,
    wis: 3,
    con: 6,
  },
  [CharacterClass.Archer]: {
    str: 3,
    dex: 10,
    int: 8,
    wis: 3,
    con: 6,
  },
  [CharacterClass.Mage]: {
    str: 3,
    dex: 3,
    int: 8,
    wis: 10,
    con: 6,
  },
  [CharacterClass.Priest]: {
    str: 3,
    dex: 3,
    int: 10,
    wis: 8,
    con: 6,
  },
};

export type CharacterDynamicAttributes = Omit<ItemAttributes, 'requiredAttributes' | 'resists'> & {
  maxTarget: number;
  spellLength: number;
};

export * from './characterAttributesSchema';
export * from './characterClassSchema';
export * from './characterSchema';
export * from './createCharacterSchema';
export * from './characterPublic';
