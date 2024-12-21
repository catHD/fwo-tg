import type { CharacterAttributes } from '@fwo/schemas';
import {
  Button, ButtonCell, Cell, List,
} from '@telegram-apps/telegram-ui';
import { useState, type FC } from 'react';

import { changeCharacterAttributes } from '@/client/character';
import { useCharacter } from '@/hooks/useCharacter';

export const CharacterAttributesPage: FC = () => {
  const { character } = useCharacter();
  const [bonus, setBonus] = useState(character.bonus);
  const [attributes, setAttributes] = useState(character.attributes);

  const increaseAttribute = (attribute: keyof CharacterAttributes) => {
    if (!attributes || !bonus || bonus === 0) {
      return;
    }

    setAttributes(() => {
      attributes[attribute]++;
      return { ...attributes };
    });
    setBonus(bonus - 1);
  };

  const decreaseAttribute = (attribute: keyof CharacterAttributes) => {
    if (!attributes || !bonus || bonus === character?.bonus) {
      return;
    }
    if (attributes[attribute] === character?.attributes[attribute]) {
      return;
    }

    setAttributes(() => {
      attributes[attribute]--;
      return { ...attributes };
    });
    setBonus(bonus + 1);
  };

  const reset = () => {
    setAttributes(structuredClone(character?.attributes));
    setBonus(character?.bonus);
  };

  const Buttons = (attribute: keyof CharacterAttributes) => {
    return (character && <>
      <ButtonCell onClick={() => increaseAttribute(attribute) }>+</ButtonCell>
      <ButtonCell onClick={() => decreaseAttribute(attribute) }>-</ButtonCell>
      </>);
  };

  return (
    <List>
        <Cell subhead='Бонус'>{bonus}</Cell>
        <Cell subhead='Сила' after={Buttons('str')}>{attributes.str}</Cell>
        <Cell subhead='Ловкость' after={Buttons('dex')}>{attributes.dex}</Cell>
        <Cell subhead='Телосложение' after={Buttons('con')}>{attributes.con}</Cell>
        <Cell subhead='Интеллект' after={Buttons('int')}>{attributes.int}</Cell>
        <Cell subhead='Мудрость' after={Buttons('wis')}>{attributes.wis}</Cell>
        <Button stretched onClick={reset}>Reset</Button>
        <Button stretched onClick={() => changeCharacterAttributes(attributes)}>Submit</Button>
    </List>
  );
};
