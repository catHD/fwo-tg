import type { Hark } from '../models/item';

export type Prof = 'm' | 'w' | 'p' | 'l';

export type ProfListLvl = Partial<Record<Prof, number>>;

type ProfItem = {
  hark: Hark;
  descr: string;
  name: string;
  icon: string;
  mag?: Record<string, number>;
}

export const profs: Record<Prof, ProfItem> = {
  w: {
    hark: {
      str: 10, dex: 8, int: 3, wis: 3, con: 6,
    },
    descr: 'стронг',
    name: 'Воин',
    icon: '🛡',
  },
  l: {
    hark: {
      str: 3, dex: 8, int: 10, wis: 3, con: 6,
    },
    descr: 'ахуенный',
    name: 'Лучник',
    icon: '🏹',
  },
  m: {
    hark: {
      str: 3, dex: 3, int: 8, wis: 10, con: 6,
    },
    mag: {
      lightHeal: 1,
    },
    descr: 'волшебный',
    name: 'Маг',
    icon: '🔮',
  },
  p: {
    hark: {
      str: 3, dex: 3, int: 10, wis: 8, con: 6,
    },
    mag: {
      lightHeal: 1,
    },
    descr: 'хилит',
    name: 'Лекарь',
    icon: '♱',
  },
};
