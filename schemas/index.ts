import { z } from 'zod';

export const idSchema = z.object({ id: z.string() });

export * from './character';
export * from './inventory';
export * from './item';
export * from './itemSet';
export * from './shared';
export * from './magic';
export * from './game';
