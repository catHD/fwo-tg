import { z } from 'zod';

export enum OrderType {
  Any = 'all',
  Enemy = 'enemy',
  Self = 'self',
  Team = 'team',
  TeamExceptSelf = 'teamExceptSelf',
}

export const actionsSchema = z.object({
  name: z.string(),
  costType: z.enum(['mp', 'en']).nullable(),
  cost: z.number().nullable(),
  orderType: z.nativeEnum(OrderType),
});

export type Action = z.infer<typeof actionsSchema>;
