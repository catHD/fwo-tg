import type { CharacterService } from '@/arena/CharacterService';
import MatchMakingService from '@/arena/MatchMakingService';
import type { WebSocketHelper } from '@/helpers/webSocketHelper';
import type { ClientToServerMessage } from '@fwo/schemas';

export class MatchMakingModule {
  static onMessage(
    message: ClientToServerMessage,
    character: CharacterService,
    ws: WebSocketHelper,
  ) {
    if (message.type !== 'match_making') {
      return;
    }

    switch (message.action) {
      case 'start_search':
        MatchMakingService.push({ id: character.id, psr: 1000, startTime: Date.now() });
        ws.publish({ ...message, data: character.toPublicObject() });
        break;
      case 'stop_search':
        MatchMakingService.pull(character.id);
        ws.publish({ ...message, data: character.toPublicObject() });

        break;
      default:
    }
  }
}
