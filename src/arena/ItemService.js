const _ = require('lodash');
const { mono } = require('../utils/formatString');
const { damageType } = require('../utils/icons');
const { default: arena } = require('./index');
/**
 * Items Service
 *
 * @description Набор функций для работы с вещами.
 * @module Service/Item
 */

const attrNames = {
  name: 'Название',
  atc: 'Атака',
  prt: 'Защита',
  price: 'Цена',
  race: 'Раса',
  weight: 'Вес',
  hark: {
    str: 'Сила',
    dex: 'Ловкость',
    wis: 'Мудрость',
    int: 'Интеллект',
    con: 'Телосложение',
  },
  plushark: {
    str: 'Сила',
    dex: 'Ловкость',
    wis: 'Мудрость',
    int: 'Интеллект',
    con: 'Телосложение',
  },
  mga: 'Магическая атака',
  mgp: 'Магическая защита',
  hl: 'Эффективность лечения',
  r_fire: `${damageType.fire} Защита от огня`,
  r_acid: `${damageType.acid} Защита от яда`,
  r_lighting: `${damageType.lighting} Защита от молнии`,
  r_frost: `${damageType.frost} Защита от холода`,
  r_physical: 'Физическая защита',
  descr: 'Описание',
  add_hp: 'Здоровье',
  add_mp: 'Мана',
  add_en: 'Энергия',
  reg_hp: 'Восстановление здоровья',
  reg_en: 'Восстановление энергии',
  reg_mp: 'Восстановление маны',
  hp_drain: 'Похищение здоровья',
  mp_drain: 'Похищение маны',
  en_drain: 'Похищение энергии',
  type: 'Тип',
  hit: 'Удар',
  edinahp: '',
  eff: '',
  '2handed': 'Двуручное',
  fire: `${damageType.fire} Урон огнём`,
  acid: `${damageType.acid} Урон ядом`,
  lighting: `${damageType.lighting} Урон молнией`,
  frost: `${damageType.frost} Урон холодом`,
};

const getRequiredHark = (char, value, hark) => {
  const name = attrNames.hark[hark];
  const pointToPutOn = char.inventory.harks[hark] - value;
  const canPutOn = pointToPutOn >= 0;
  return `\t\t${canPutOn ? '✅' : '❗️'} ${name}: ${value} ${canPutOn ? '' : `(${pointToPutOn})`}`;
};

/**
 * @param {number | null} value
 * @param {string} key
 */
const getPlusHark = (value, key) => {
  if (!_.isNull(value) && value > 0) {
    return `\t\t➕ ${attrNames.hark[key]}: ${value}`;
  }
  return '';
};

const getAdditionalHarks = (item) => {
  const elementMessage = (key) => {
    const value = item[key];
    if (value) {
      if (typeof value === 'object') {
        return value.max > 0 ? `\t\t➕ ${attrNames[key]}: ${value.min}-${value.max}` : '';
      }
      return `\t\t➕ ${attrNames[key]}: ${value}`;
    }
    return '';
  };

  return [
    'mga',
    'mgp',
    'fire',
    'acid',
    'lighting',
    'frost',
    'hl',

    'r_fire',
    'r_acid',
    'r_lighting',
    'r_frost',
    'r_physical',

    'add_hp',
    'add_mp',
    'add_en',

    'reg_hp',
    'reg_en',
    'reg_mp',

    'hp_drain',
    'mp_drain',
    'en_drain',
  ].map(elementMessage).filter((x) => x).join('\n');
};

module.exports = {
  attrNames,
  /**
   *
   * @param {import('./CharacterService').default} char
   * @param {import('../models/item').Item} item
   */
  itemDescription(char, item) {
    const additionalHarks = getAdditionalHarks(item);
    return [
      `${item.name} ${item.price ? `(💰 ${item.price})` : ''}`,
      item.descr && `\n${item.descr}\n`,
      item.atc && mono(`\t\t🗡 Атака: ${item.atc}`),
      item.hit && mono(`\t\t⚔️ Удар: ${item.hit.min}-${item.hit.max}`),
      item.prt && mono(`\t\t🛡 Защита: ${item.prt}`),

      item.hark && `\n👤 Требуемые характеристики:\n${mono(
        _.map(item.hark, (val, key) => getRequiredHark(char, val, key)).join('\n'),
      )}`,

      item.plushark && `\n↗️ Дополнительные характеристики:\n${mono(
        _.map(item.plushark, getPlusHark).filter((x) => x).join('\n'),
      )}`,

      additionalHarks && `\n${mono(additionalHarks)}`,

      item.weight && `\nВес: ${item.weight} кг`,
    ]
      .filter(Boolean)
      .join('\n');
  },
};
