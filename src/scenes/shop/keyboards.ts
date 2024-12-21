import _ from 'lodash';
import { Markup } from 'telegraf';
import type { Convenience } from 'telegraf/types';
import arena from '../../arena';
import type { CharacterService } from '../../arena/CharacterService';
import { stores } from '../../arena/MiscService';
import type { Profs } from '../../data';
import type { Item } from '@fwo/schemas';
import type { CharacterClass } from '@fwo/schemas';

const storeKeys = Object.keys(stores);

const itemToButton = (item: Item) => [Markup.button.callback(
  `${item.info.name} (💰 ${item.price})`,
  `itemInfo_${item.code}`,
)];

/**
 * Возвращет кнопки по всем типам вещей из stores
 */
const getTypeButtons = () => storeKeys.map((type) => [Markup.button.callback(
  `${stores[type]}`,
  `itemType_${type}`,
)]);

/**
 * Возвращает предметы по выбранному типу.
 * Не показывает вещи, которые не подходят персонажу по профессии
 * @param wear - тип вещей (куда надевается)
 * @param prof - профессия персонажа
 */
const getItems = (wear: string, prof: Profs.Prof) => {
  const items: Item[] = _.filter(
    arena.items,
    (item: Item) => item.wear === wear && item.class.includes(prof as CharacterClass),
  );
  const buttons = items
    .sort((a, b) => b.price - a.price)
    .map(itemToButton);
  buttons.push([Markup.button.callback(
    'Назад',
    'back',
  )]);
  return buttons;
};

export const enter = (): Convenience.ExtraEditMessageText => Markup.inlineKeyboard([
  ...getTypeButtons(),
  [Markup.button.callback('Коллекции', 'collectionList')],
]);

export const itemType = (
  type: string, char: CharacterService,
): Convenience.ExtraEditMessageText => Markup.inlineKeyboard(
  getItems(type, char.prof),
);

export const itemInfo = (code: string):Convenience.ExtraEditMessageText => ({
  ...Markup.inlineKeyboard([
    [
      Markup.button.callback(
        'Купить',
        `buy_${code}`,
      ),
      Markup.button.callback(
        'Назад',
        `itemType_${arena.items[code].wear}`,
      ),
    ],
  ]),
  parse_mode: 'Markdown',
});

export const buy = (code: string): Convenience.ExtraEditMessageText => Markup.inlineKeyboard([
  [Markup.button.callback(
    'В инвентарь',
    'inventory',
  )],
  [Markup.button.callback(
    'Продолжить покупки',
    `itemType_${arena.items[code].wear}`,
  )],
]);

