import { deleteCharacter } from '@/client/character';
import { useCharacter } from '@/hooks/useCharacter';
import { popup } from '@telegram-apps/sdk-react';
import { ButtonCell, List } from '@telegram-apps/telegram-ui';

export function SettingsPage() {
  const { setCharacter } = useCharacter();

  const handleClick = async () => {
    const buttonId = await popup.open({
      title: 'Удаление персонажа',
      message: 'Персонаж будет удалён навсегда',
      buttons: [{ text: 'Удалить', type: 'destructive', id: 'delete' }, { type: 'cancel' }],
    });

    if (buttonId === 'delete') {
      await deleteCharacter();
      setCharacter(undefined);
    }
  };

  return (
    <List>
      <ButtonCell onClick={() => handleClick()}>Удалить персонажа</ButtonCell>
    </List>
  );
}
