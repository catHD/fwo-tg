import type { GameStatus } from '@fwo/schemas';
import { Cell, List } from '@telegram-apps/telegram-ui';

export function GameStatusComponent({ status }: { status: GameStatus[] }) {
  return (
    <List>
      {status.map((status) => (
        <Cell
          key={status.name}
          description={
            <>
              {status.hp && <div>HP: {status.hp}</div>}
              {status.mp && <div>MP: {status.mp}</div>}
              {status.en && <div>SP: {status.en}</div>}
            </>
          }
        >
          {status.name}
        </Cell>
      ))}
    </List>
  );
}
