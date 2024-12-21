import { CharacterClass } from '@fwo/schemas';

export const characterClassList = Object.values(CharacterClass);

export const characterClassNameMap: Record<CharacterClass, string> = {
  [CharacterClass.Archer]: 'Лучник',
  [CharacterClass.Mage]: 'Маг',
  [CharacterClass.Priest]: 'Лекарь',
  [CharacterClass.Warrior]: 'Воин',
};

export const characterClassImageMap: Record<CharacterClass, string> = {
  [CharacterClass.Archer]: '/images/warrior.png',
  [CharacterClass.Mage]: '/images/mage.png',
  [CharacterClass.Priest]: '/images/mage.png',
  [CharacterClass.Warrior]: '/images/warrior.png',
};
