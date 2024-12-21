import { getMagicList } from '@/client/magic';
import { useCharacter } from '@/hooks/useCharacter';
import { ButtonCell, Cell, List, Modal, Spinner } from '@telegram-apps/telegram-ui';
import { useEffect, useState } from 'react';
import type { Magic } from '@fwo/schemas';

export const CharacterMagics = () => {
  const { character } = useCharacter();

  const [magics, setMagics] = useState<Magic[]>([]);

  useEffect(() => {
    getMagicList(Object.keys(character.magics)).then((magics) => {
      setMagics(magics ?? []);
    });
  }, [character.magics]);

  const Magic = ({ magic }: { magic: Magic }) => {
    const { lvl, cost, displayName, desc, name } = magic;
    return (
      <Modal
        header={<Modal.Header>Only iOS header</Modal.Header>}
        trigger={
          <ButtonCell>
            {displayName}: {character.magics[name]}
          </ButtonCell>
        }
      >
        <List>
          <Cell subhead="Name">{displayName}</Cell>
          <Cell subhead="Description">{desc}</Cell>
          <Cell subhead="Level">{lvl}</Cell>
          <Cell subhead="Cost">{cost}💧</Cell>
        </List>
      </Modal>
    );
  };

  if (!magics.length) {
    return <Spinner size="l" />;
  }

  return (
    <List>
      {magics.map((magic) => (
        <Magic key={magic.name} magic={magic} />
      ))}
    </List>
  );
};
