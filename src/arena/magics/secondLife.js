const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Вторая жизнь
 * Основное описание магии общее требовани есть в конструкторе
 */
const secondLife = new CommonMagic({
  name: 'secondLife',
  desc: 'Воскрешает цель',
  cost: 20,
  baseExp: 8,
  costType: 'mp',
  lvl: 1,
  orderType: 'all',
  aoeType: 'target',
  magType: 'good',
  chance: [
    '1d60+30',
    '1d70+40',
    '1d80+50'], //  effect: ['1d4+2', '1d3+3', '1d2+4'],
  profList: ['p'],
});
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
secondLife.run = function blessing(initiator, target) {
  // if hp < 0 , wasHP = |hp|
  // set hp 0.05
  // set exp wasHP * baseExp
};
module.exports = secondLife;