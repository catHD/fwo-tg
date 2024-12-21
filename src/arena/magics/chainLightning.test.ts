import {
  describe, beforeAll, beforeEach, afterEach, it, spyOn, expect,
} from 'bun:test';
import casual from 'casual';
import { times } from 'lodash';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { chainLightning } from './chainLightning';
// npm t src/arena/magics/chainLightning.test.ts

describe('chainLightning', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);
  });

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ prof: 'm', magics: { chainLightning: 3 } });
    const chars = await Promise.all(times(10, () => TestUtils.createCharacter()));
    const charIds = chars.map(({ id }) => id);

    await TestUtils.createClan(charIds[1], {
      players: charIds.slice(0, 6),
    });

    await Promise.all(charIds.map(CharacterService.getCharacterById));

    game = new GameService([initiator.id, ...charIds]);
  });

  beforeEach(() => {
    spyOn(global.Math, 'random').mockReturnValue(0.15);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should hit 5 targets', () => {
    game.players.players[0].proc = 1;

    chainLightning.cast(game.players.players[0], game.players.players[1], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should hit 4 targets', () => {
    game.players.players[0].magics = { chainLightning: 2 };
    game.players.players[0].proc = 1;

    chainLightning.cast(game.players.players[0], game.players.players[1], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should hit 3 targets', () => {
    game.players.players[0].magics = { chainLightning: 1 };
    game.players.players[0].proc = 1;

    chainLightning.cast(game.players.players[0], game.players.players[1], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should hit 3 targets without clan', () => {
    game.players.players[0].magics = { chainLightning: 1 };
    game.players.players[0].proc = 1;

    chainLightning.cast(game.players.players[0], game.players.players[8], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
