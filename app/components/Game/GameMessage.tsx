import type { GameMessage } from '@fwo/schemas';
import { Cell } from '@telegram-apps/telegram-ui';
import { formatMessage } from '../../../src/arena/LogService/utils';

export function GameMessageComponent({ message }: { message: GameMessage }) {
  switch (message.action) {
    case 'start':
      return <Cell>Игра начинается</Cell>;
    case 'startRound':
      return <Cell>Начался раунд {message.round}</Cell>;
    case 'endRound':
      return <Cell>Раунд закончился</Cell>;
    case 'startOrders':
      return <Cell>Начался этап заказов</Cell>;
    case 'endOrders':
      return <Cell>Закончился этап заказов</Cell>;
    case 'dead':
      return <Cell>Погибшие в этом раунде: {message.dead.map((name) => name).join(', ')}</Cell>;
    case 'kick':
      return (
        <Cell>
          {message.player.name} был кикнут из игры: {message.reason}
        </Cell>
      );
    case 'log':
      return message.messages.map((message, index) => (
        <Cell key={index}>{formatMessage(message)}</Cell>
      ));
    default:
      return null;
  }
}
