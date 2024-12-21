import { actionsSchema, publicPlayerSchema } from '@/shared';
import { z } from 'zod';
import { gameStatus, publicGameStatus } from './gameStatus';

export const gameMessageSchema = z.discriminatedUnion('action', [
  z.object({
    type: z.literal('game'),
    action: z.literal('start'),
    gameID: z.string(),
  }),
  z.object({
    type: z.literal('game'),
    action: z.enum(['endRound', 'startOrders', 'endOrders']),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('order'),
    proc: z.number(),
    actions: actionsSchema.array(),
    magics: actionsSchema.array(),
    skills: actionsSchema.array(),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('startRound'),
    round: z.number(),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('end'),
    reason: z.string().optional(),
    statistic: z.any(),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('status'),
    status: gameStatus.array(),
    statusByClan: z.record(publicGameStatus.array()),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('kick'),
    reason: z.string(),
    player: publicPlayerSchema,
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('preKick'),
    reason: z.string(),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('dead'),
    dead: publicPlayerSchema.array(),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('log'),
    messages: z.any().array(),
  }),
]);

export type GameMessage = z.infer<typeof gameMessageSchema>;
