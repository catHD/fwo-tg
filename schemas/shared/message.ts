import { characterPublicSchema } from '@/character';
import { gameMessageSchema } from '@/game';
import { z } from 'zod';
import { orderSchema } from './orderSchema';

export const clientToServerMessageSchema = z.union([
  z.object({ id: z.string().optional(), type: z.literal('lobby'), action: z.literal('enter') }),
  z.object({ id: z.string().optional(), type: z.literal('lobby'), action: z.literal('leave') }),
  z.object({
    id: z.string().optional(),
    type: z.literal('match_making'),
    action: z.literal('start_search'),
  }),
  z.object({
    id: z.string().optional(),
    type: z.literal('match_making'),
    action: z.literal('stop_search'),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('order'),
    order: orderSchema,
  }),
]);

export type ClientToServerMessage = z.infer<typeof clientToServerMessageSchema>;

export const serverToClientMessageSchema = z.union([
  z.object({
    id: z.string().optional(),
    type: z.literal('lobby'),
    action: z.literal('enter'),
    data: characterPublicSchema,
  }),
  z.object({
    id: z.string().optional(),
    type: z.literal('lobby'),
    action: z.literal('leave'),
    data: characterPublicSchema,
  }),
  z.object({
    id: z.string().optional(),
    type: z.literal('match_making'),
    action: z.literal('start_search'),
    data: characterPublicSchema,
  }),
  z.object({
    id: z.string().optional(),
    type: z.literal('match_making'),
    action: z.literal('stop_search'),
    data: characterPublicSchema,
  }),
  gameMessageSchema,
]);

export type ServerToClientMessage = z.infer<typeof serverToClientMessageSchema>;
