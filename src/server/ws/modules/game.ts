import type { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import MatchMakingService from '@/arena/MatchMakingService';
import ActionsHelper from '@/helpers/actionsHelper';
import { WebSocketHelper } from '@/helpers/webSocketHelper';
import type { ClientToServerMessage, GameMessage, Order } from '@fwo/schemas';

export abstract class GameModule {
  static createGameStartHandler(character: CharacterService, ws: WebSocketHelper) {
    return (gameID: string, players: string[]) => {
      if (!players.includes(character.id)) {
        return;
      }

      const game = character.currentGame;

      if (!game) {
        console.error(game, 'ws game: game not found');
        return;
      }

      GameModule.subscribe(character, ws, gameID);

      game.on('game', GameModule.createGameMessageHandler(character, game, ws));
    };
  }

  static createGameMessageHandler(
    character: CharacterService,
    game: GameService,
    ws: WebSocketHelper,
  ) {
    return (message: GameMessage, scope?: string) => {
      switch (message.action) {
        case 'end':
          GameModule.unsubscribe(character, ws, game.info.id);
          GameModule.sendGameMessage(game.info.id, message, scope);
          break;
        case 'startOrders':
          GameModule.sendAvailableActions(character, ws);
          break;
        default:
          GameModule.sendGameMessage(game.info.id, message, scope);
      }
    };
  }

  static onOpen(character: CharacterService, ws: WebSocketHelper) {
    const handleGameStart = GameModule.createGameStartHandler(character, ws);

    MatchMakingService.on('start', handleGameStart);
  }

  static onMessage(
    message: ClientToServerMessage,
    character: CharacterService,
    ws: WebSocketHelper,
  ) {
    switch (message.action) {
      case 'order':
        GameModule.orderAction(character, ws, message.order);
        GameModule.sendAvailableActions(character, ws);
        break;
      default:
        console.log(message);
    }
  }

  static sendGameMessage(gameID: string, message: GameMessage, scope?: string) {
    if (scope) {
      WebSocketHelper.server.publish(`${gameID}:${scope}`, JSON.stringify(message));
    } else {
      WebSocketHelper.server.publish(gameID, JSON.stringify(message));
    }
  }

  private static orderAction(character: CharacterService, _ws: WebSocketHelper, order: Order) {
    const game = character.currentGame;

    if (!game) {
      console.error('ws game: game not found');
      return;
    }

    game.orders.orderAction({
      initiator: character.id,
      target: order.target,
      action: order.action,
      proc: order.proc,
    });
  }

  private static subscribe(character: CharacterService, ws: WebSocketHelper, gameID: string) {
    const channel = `${gameID}:${character.clan?.name ?? 'noClan'}`;
    ws.raw.subscribe(gameID);
    ws.raw.subscribe(channel);
  }

  private static unsubscribe(character: CharacterService, ws: WebSocketHelper, gameID: string) {
    const channel = `${gameID}:${character.clan?.name ?? 'noClan'}`;
    ws.raw.unsubscribe(gameID);
    ws.raw.unsubscribe(channel);
  }

  private static sendAvailableActions(character: CharacterService, ws: WebSocketHelper) {
    const game = character.currentGame;
    const player = game?.players.getById(character.id);

    if (!game || !player) {
      console.assert('ws game: game not found');
      console.assert('ws game: player %s not found', character.id);
      return;
    }

    ws.send({
      type: 'game',
      action: 'order',
      proc: player.proc,
      actions: ActionsHelper.getBasicActions(player, game),
      magics: ActionsHelper.getAvailableMagics(player, game),
      skills: ActionsHelper.getAvailableSkills(player, game),
    });
  }
}
