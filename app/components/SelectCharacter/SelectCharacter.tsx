import type { CreateCharacterDto, CharacterClass } from '@fwo/schemas';
import {
  Button, CompactPagination, Headline, Input, List, Section,
} from '@telegram-apps/telegram-ui';
import { useEffect, useRef, useState } from 'react';
import { characterClassImageMap, characterClassList, characterClassNameMap } from '@/constants/character';
import styles from './SelectCharacter.module.css';

const Slide = ({ value }: { value: CharacterClass }) => {
  return (
    <div className={styles.slide}>
      <img src={characterClassImageMap[value]} alt={characterClassImageMap[value]} />
      <Headline weight='2'>{characterClassNameMap[value]}</Headline>
    </div>
  );
};

type SelectCharacterClassProps = { onSelect: (createCharacter: CreateCharacterDto) => void}

export const SelectCharacter = ({ onSelect }: SelectCharacterClassProps) => {
  const [selected, setSelected] = useState(0);
  const [name, setName] = useState('');
  const slider = useRef<HTMLDivElement>(null);

  const next = () => {
    setSelected((selected + 1) % characterClassList.length);
  };

  const prev = () => {
    setSelected((selected - 1 + characterClassList.length) % characterClassList.length);
  };

  useEffect(() => {
    slider.current?.style.setProperty('--slide', selected.toString());
  }, [selected]);

  const handleSelectCharacter = () => {
    onSelect({
      name,
      class: characterClassList[selected],
    });
  };

  return (
    <List>
      <Section header={<Section.Header large>Создайте вашего персонажа</Section.Header>}>
        <CompactPagination>
          {characterClassList.map((value, index) => (
            <CompactPagination.Item key={value} selected={selected === index} />
          ))}
        </CompactPagination>
        <div className={styles.slider}>
          <Button onClick={prev} className={styles.button}>{'◄'}</Button>
          <div className={styles.slides} data-selected={selected} ref={slider}>
            {characterClassList.map((value) => <Slide key={value} value={value}/>)}
            </div>
          <Button onClick={next} className={styles.button}>{'►'}</Button>
        </div>
        <Input header='Имя персонажа' value={name} placeholder='Введите имя персонажа' onChange={(e) => setName(e.target.value)} />
        <Button stretched disabled={!name} onClick={handleSelectCharacter}>Создать</Button>
      </Section>
    </List>
  );
};
