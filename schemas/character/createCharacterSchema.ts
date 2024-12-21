import { z } from 'zod';
import { characterClassSchema } from './characterClassSchema';

export const createCharacterSchema = z.object({
  name: z.string().min(3),
  class: characterClassSchema,
});

export type CreateCharacterDto = z.infer<typeof createCharacterSchema>;
