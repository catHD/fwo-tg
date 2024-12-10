import { Hono } from 'hono';
// import { cors } from 'hono/cors';
// import { logger } from 'hono/logger';
import { character } from './character';
import { inventory } from './inventory';
import { magic } from './magic';
import { skill } from './skill';
import { ws } from './ws';

export const app = new Hono()
  .route('/character', character)
  .route('/magic', magic)
  .route('/skill', skill)
  .route('/ws', ws);

export default app;

export declare type Server = typeof app;
