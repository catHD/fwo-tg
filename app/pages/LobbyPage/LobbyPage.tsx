import { LobbyMessageComponent } from '@/components/Lobby/LobbyMessage';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { ServerToClientMessage } from '@fwo/schemas';
import { ButtonCell, Cell, List } from '@telegram-apps/telegram-ui';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function LobbyPage() {
  const { ws } = useWebSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ServerToClientMessage[]>([]);

  const handleMessage = useCallback(
    (message: ServerToClientMessage) => {
      if (message.type === 'game' && message.action === 'start') {
        navigate(`/game/${message.gameID}`);
      }
      setMessages((messages) => messages.concat(message));
    },
    [navigate],
  );

  useEffect(() => {
    const unsubscribe = ws.subscribe(handleMessage);

    return () => unsubscribe();
  }, [ws, handleMessage]);

  useEffect(() => {
    ws.send({ type: 'lobby', action: 'enter' });

    return () => {
      ws.send({ type: 'match_making', action: 'stop_search' });
      ws.send({ type: 'lobby', action: 'leave' });
    };
  }, [ws]);

  const handleClick = async () => {
    ws.send({ type: 'match_making', action: 'start_search' });
  };

  return (
    <List>
      {messages.map((message, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <LobbyMessageComponent key={index} message={message} />
      ))}

      <ButtonCell onClick={() => navigate('/game/test')}>debug game</ButtonCell>
      <ButtonCell onClick={() => handleClick()}>Начать поиск игры</ButtonCell>
    </List>
  );
}
