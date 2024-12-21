import type { Chance } from '@/arena/PlayersService';
import type { Modifiers } from '@fwo/schemas';

export function convertItemModifiers(modifiers: Modifiers[]): Chance {
  return modifiers.reduce<Chance>(
    (acc, { type, chance }) => {
      if (chance < 0) {
        acc.fail[type] ??= 0;
        acc.fail[type] -= chance;
      } else {
        acc.cast[type] ??= 0;
        acc.cast[type] += chance;
      }

      return acc;
    },
    { fail: {}, cast: {} },
  );
}
