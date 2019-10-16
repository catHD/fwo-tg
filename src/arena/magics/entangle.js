const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Опутывание
 * Основное описание магии общее требовани есть в конструкторе
 */
const entangle = new CommonMagic({
  name: 'entangle',
  desc: 'Уменьшает защиту цели.',
  cost: 3,
  baseExp: 6,
  costType: 'mp',
  lvl: 1,
  orderType: 'enemy',
  aoeType: 'target',
  magType: 'bad',
  chance: [100, 100, 100],
  effect: ['1d2+4', '1d2+5', '1d2+6'],
  profList: ['p'],
});
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
entangle.run = function entangle(initiator, target) {
  target.stats.mode('down', 'pdef', this.effectVal(initiator));
};
module.exports = entangle;