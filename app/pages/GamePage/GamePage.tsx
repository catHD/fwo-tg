import { GameMessageComponent } from '@/components/Game/GameMessage';
import { GameStatusComponent } from '@/components/Game/GameStatus';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Action, GameStatus, ServerToClientMessage } from '@fwo/schemas';
import { ButtonCell, Cell, List, Slider } from '@telegram-apps/telegram-ui';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

export function GamePage() {
  const { ws } = useWebSocket();
  const { gameID } = useParams();

  const [messages, setMessages] = useState<ServerToClientMessage[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [magics, setMagics] = useState<Action[]>([]);
  const [skills, setSkills] = useState<Action[]>([]);
  const [power, setPower] = useState(0);
  const [remainPower, setRemainPower] = useState(100);
  const [status, setStatus] = useState<GameStatus[]>([]);

  const handleMessage = useCallback((message: ServerToClientMessage) => {
    setMessages((messages) => messages.concat(message));
    if (message.type !== 'game') {
      return;
    }

    if (message.action === 'order') {
      setActions(message.actions);
      setMagics(message.magics);
      setSkills(message.skills);
      setRemainPower(message.proc);
    }

    if (message.action === 'endOrders') {
      setActions([]);
      setMagics([]);
      setSkills([]);
    }

    if (message.action === 'status') {
      setStatus(message.status);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = ws.subscribe(handleMessage);

    return () => unsubscribe();
  }, [ws, handleMessage]);

  useEffect(() => {
    ws.send({ type: 'lobby', action: 'enter' });

    return () => {
      ws.send({ type: 'lobby', action: 'leave' });
      ws.send({ type: 'match_making', action: 'stop_search' });
    };
  }, [ws]);

  const handleClick = async () => {
    ws.send({ type: 'match_making', action: 'start_search' });
  };

  const handleActionClick = async (action: Action) => {
    ws.send({
      type: 'game',
      action: 'order',
      order: {
        action: action.name,
        target: '675834439ab73b12ebe8a44c',
        proc: power,
      },
    });
  };

  const handleSliderChange = (value: number) => {
    setPower(Math.min(remainPower, value));
  };

  return (
    <List>
      <GameStatusComponent status={status} />
      {messages.map((message, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <GameMessageComponent key={index} message={message} />
      ))}

      <ButtonCell onClick={() => handleClick()}>Начать поиск игры</ButtonCell>

      {actions.map((action) => (
        <ButtonCell onClick={() => handleActionClick(action)} key={action.name}>
          {action.name}
        </ButtonCell>
      ))}
      <Slider min={0} max={100} step={5} onChange={handleSliderChange} />
    </List>
  );
}
