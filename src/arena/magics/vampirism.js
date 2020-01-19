const DmgMagic = require('../Constuructors/DmgMagicConstructor');
/**
 * Вампиризм
 * Основное описание магии общее требовани есть в конструкторе
 */

/** @typedef {import ('../PlayerService')} player */

const vampirism = new DmgMagic({
  name: 'vampirism',
  displayName: 'Вампиризм',
  desc: 'Возвращает часть нанесеного урона в качесте жизней',
  cost: 12,
  baseExp: 10,
  costType: 'mp',
  lvl: 3,
  orderType: 'enemy',
  aoeType: 'target',
  magType: 'bad',
  chance: [92, 94, 95],
  effect: ['1d6+4', '1d5+5', '1d4+6'],
  dmgType: 'clear',
  profList: ['m'],
});
/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 */
vampirism.run = function run(initiator, target) {
  target.stats.mode('down', 'hp', this.effectVal());
  initiator.stats.mode('up', 'hp', this.status.hit);
};
module.exports = vampirism;
