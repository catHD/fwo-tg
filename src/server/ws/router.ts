import type { ClientToServerMessage } from '@fwo/schemas';
import type { CharacterService } from '@/arena/CharacterService';
import type { WebSocketHelper } from '@/helpers/webSocketHelper';
import { LobbyModule } from './modules/lobby';
import { MatchMakingModule } from './modules/matchMaking';
import { GameModule } from './modules/game';

export class WebSocketRouter {
  ws: WebSocketHelper;
  character: CharacterService;

  constructor(ws: WebSocketHelper, character: CharacterService) {
    this.ws = ws;
    this.character = character;
  }

  onClosed() {
    LobbyModule.onClosed(this.character, this.ws);
  }

  onMessage(message: ClientToServerMessage) {
    switch (message.type) {
      case 'lobby':
        LobbyModule.onMessage(message, this.character, this.ws);
        break;
      case 'match_making':
        MatchMakingModule.onMessage(message, this.character, this.ws);
        break;
      case 'game':
        GameModule.onMessage(message, this.character, this.ws);
    }
  }

  onOpen() {
    GameModule.onOpen(this.character, this.ws);
  }
}
