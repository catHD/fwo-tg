import type { ServerToClientMessage } from '@fwo/schemas';
import { Cell } from '@telegram-apps/telegram-ui';

export function LobbyMessageComponent({ message }: { message: ServerToClientMessage }) {
  if (message.type === 'lobby') {
    if (message.action === 'enter') {
      return <Cell>Игрок {message.data.name} присоединяется к лобби</Cell>;
    }
    if (message.action === 'leave') {
      return <Cell>Игрок {message.data.name} покинул лобби</Cell>;
    }
  }
  if (message.type === 'match_making') {
    if (message.action === 'start_search') {
      return <Cell>Игрок {message.data.name} начинает поиск игры</Cell>;
    }
    if (message.action === 'stop_search') {
      return <Cell>Игрок {message.data.name} прекратил поиск игры</Cell>;
    }
  }
}
