import type { CharacterService } from '@/arena/CharacterService';
import type { WebSocketHelper } from '@/helpers/webSocketHelper';
import type { ClientToServerMessage } from '@fwo/schemas';

export abstract class LobbyModule {
  static onClosed(character: CharacterService, ws: WebSocketHelper) {
    LobbyModule.leave(character, ws);
  }

  static onMessage(
    message: ClientToServerMessage,
    character: CharacterService,
    ws: WebSocketHelper,
  ) {
    if (message.type !== 'lobby') {
      return;
    }

    switch (message.action) {
      case 'enter':
        LobbyModule.enter(character, ws);
        break;
      case 'leave':
        LobbyModule.leave(character, ws);
        break;
      default:
    }
  }

  private static enter(character: CharacterService, ws: WebSocketHelper) {
    ws.raw.subscribe('lobby');
    ws.raw.subscribe('match_making');
    ws.publish({ type: 'lobby', action: 'enter', data: character.toPublicObject() });
  }

  private static leave(character: CharacterService, ws: WebSocketHelper) {
    ws.raw.unsubscribe('lobby');
    ws.raw.unsubscribe('match_making');
    ws.publish({ type: 'lobby', action: 'leave', data: character.toPublicObject() });
  }
}
