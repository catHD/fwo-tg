/**
 * @description Просто мусорка с кастомными функциями
 * @module Service/Misc
 */
/**
 * @typedef {Object} weaponType
 * @property {string} name
 * @property {function} action
 */
/** @type {Object.<string, weaponType>} */
const WEAPON_TYPES = {
  thrust: {
    name: 'колющее',
    action: (target, weapon) => `вонзил _${weapon.info.name}_ в *${target.nick}*`,
  },
  cut: {
    name: 'режущее',
    action: (target, weapon) => `пустил кровь *${target.nick}* с помощью _${weapon.info.name}_`,
  },
  chop: {
    name: 'рубящее',
    action: (target, weapon) => `рубанул *${target.nick}* _${weapon.info.case}_`,
  },
  heal: {
    name: 'лечащее',
    action: (target, weapon) => `вонзил _${weapon.info.name}_ в *${target.nick}*`,
  },
  range: {
    name: 'метательное',
    action: (target, weapon) => `швырнул в *${target.nick}* _${weapon.info.case}_`,
  },
  m: {
    name: 'дальнобойное',
    action: (target, weapon) => `стрельнул в *${target.nick}* _${weapon.info.case}_`,
  },
  f: {
    name: 'зажигательное',
    action: (target, weapon) => `обжег *${target.nick}* с помощью _${weapon.info.case}_`,
  },
  stun: {
    name: 'оглушающее',
    action: (target, weapon) => `дал по башке *${target.nick}* _${weapon.info.case}_`,
  },
  r: {
    name: 'спецоружие',
    action: (target, weapon) => `атаковал *${target.nick}* _${weapon.info.case}_`,
  },
};
/**
 * Константа дефотлный параметров професcий при создание чара
 */
const STORES = {
  a: 'Пр.рука',
  b: 'Лв.рука',
  c: 'Тело',
  d: 'Голова',
  e: 'Ноги',
  f: 'Пояс',
  h: 'Пр.запястье',
  i: 'Лв.запястье',
  j: 'Плечи',
  k: 'Пр.больш.палец',
  l: 'Пр.указ.палец',
  m: 'Пр.сред.палец',
  n: 'Пр.безым.палец',
  o: 'Пр.мизинец',
  p: 'Лв.больш.палец',
  r: 'Лв.указ.палец',
  s: 'Лв.сред.палец',
  t: 'Лв.безым.палец',
  u: 'Лв.мизинец',
  1: 'Свитки',
  x: 'Зелья',
  y: 'Сырье',
  z: 'Промтовары',
  q: 'Руки',
  v: 'Ухо',
  w: 'Обувь',
  ab: 'Двуручное оружие',
};

/**
 * Рандомное значние между min - max
 * @param {Number} min
 * @param {Number} max
 * @return {Number} Рандомное floatNumber значение
 */
function randFloat(min, max) {
  const tempMax = +max;
  const tempMin = +min;
  return (Math.random() * (tempMax - tempMin) + tempMin);
}
/**
 * Рандомное целое значние между min - max
 * @param {Number} min
 * @param {Number} max
 * @return {Number} Рандомное floatNumber значение
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (+max - +min) + +min);
}

export default class MiscService {
  static weaponTypes = WEAPON_TYPES;
  static stores = STORES;
  static getWeaponAction(target, weapon) {
    return WEAPON_TYPES[weapon.type].action(target, weapon);
  }
  /**
   * Функция рандома по формату 1d100+10;
   * @param {String} diceStr параметры рандома в формате 1d100
   * @return {Number} число в разбросе от diceStr (1d100)
   */
  static dice(diceStr) {
    let result = 0;
    const sec = diceStr.split('+');
    if (sec.length === 2) {
      const parts = sec[0].split('d');
      result = randFloat(parts[0], parts[1]) + Number(sec[1]);
    } else {
      const parts = diceStr.split('d');
      result = randFloat(parts[0], parts[1]);
    }
    return result;
  } /**
   * Функция рандома по формату 1d100;
   * @param {String} dstr параметры рандома в формате 1d100
   * @return {Number} число в разбросе от diceStr (1d100)
   */
  static rndm(dstr) {
    const part = dstr.split('d');
    const min = +part[0] || 1;
    const max = +part[1];
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  static randFloat = randFloat
  static randInt = randInt
};
