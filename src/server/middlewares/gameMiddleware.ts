import type { User } from '@telegram-apps/init-data-node';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import type { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';

export type GameEnv = {
  Variables: {
    character: CharacterService;
    user: User;
    game: GameService;
    player: Player;
  };
};

export const gameMiddleware = createMiddleware<GameEnv>(async (c, next) => {
  const character = c.get('character');

  const game = character.currentGame;
  if (!game) {
    throw new HTTPException(401);
  }

  const player = game.players.getById(character.id);

  if (!player) {
    throw new HTTPException(401);
  }

  c.set('game', game);
  c.set('player', player);

  await next();
});
