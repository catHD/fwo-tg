import { z } from 'zod';

export const gameStatus = z.object({
  name: z.string(),
  hp: z.number(),
  mp: z.number(),
  en: z.number(),
});

export const publicGameStatus = gameStatus.pick({ name: true, hp: true });

export type GameStatus = z.infer<typeof gameStatus>;
export type PublicGameStatus = z.infer<typeof publicGameStatus>;
