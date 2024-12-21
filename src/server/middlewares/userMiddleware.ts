import type { User } from '@telegram-apps/init-data-node';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { getToken } from '@/server/utils/getToken';
import { validateToken } from '@/server/utils/validateToken';

export type UserEnv = { Variables: { user: User } };

export const userMiddleware = createMiddleware<UserEnv>(async (c, next) => {
  const token = getToken(c);
  const [type, value] = token?.split(' ') ?? [];
  const user = validateToken(type, value);

  if (!user) {
    throw new HTTPException(401);
  }
  c.set('user', user);

  await next();
});
