import { z } from 'zod';

export enum CharacterClass {
  Warrior = 'w',
  Mage = 'm',
  Archer = 'l',
  Priest = 'p',
}

export const characterClassSchema = z.nativeEnum(CharacterClass);
