const DmgMagic = require('../Constuructors/DmgMagicConstructor');
/**
 * Ядовитое дыхание
 * Основное описание магии общее требовани есть в конструкторе
 */
const poisonBreath = new DmgMagic({
  name: 'poisonBreath',
  desc: 'Повреждает цель ядовитым дыханием, нанося урон.',
  cost: 6,
  baseExp: 12,
  costType: 'mp',
  lvl: 1,
  orderType: 'enemy',
  aoeType: 'target',
  magType: 'bad',
  chance: [92, 94, 95],
  effect: ['1d3+1', '1d3+2', '1d3+3'],
  dmgType: 'acid',
  profList: ['m'],
});
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
poisonBreath.run = (initiator, target) => {
  target.stats.mode('down', 'hp', this.effectVal(initiator));
};
module.exports = poisonBreath;