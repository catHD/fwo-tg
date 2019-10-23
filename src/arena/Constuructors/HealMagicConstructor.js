const floatNumber = require('../floatNumber');
const MiscService = require('../MiscService');
/**
 * Heal Class
 */
class Heal {
  /**
   * Общий конструктор
   * @param {Object} params экшена
   */
  constructor(params) {
    Object.assign(this, params);
    this.status = {};
  }

  /**
   * Основная функция выполнения. Из неё дёргаются все зависимости
   * Общий метод каста магии
   * в нём выполняются общие функции для всех магий
   * @param {Object} initiator Обьект кастера
   * @param {Object} target Обьект цели
   * @param {Object} game Обьект игры (не обязателен)
   */
  cast(initiator, target, game) {
    this.params = {
      initiator, target, game,
    };

    try {
      this.run(initiator, target, game);
      // Получение экспы за хил следует вынести в отдельный action следующий
      // за самим хилом, дабы выдать exp всем хиллерам после формирования
      // общего массива хила
      //     this.getExp(initiator, target, game);
      this.backToLife();
      this.next();
    } catch (e) {
      this.breaks(e);
    }
  }

  /**
   * Функция выполняет проверку, является ли хил "воскресившим", т.е если
   * цель до выпонения личения имела статус "isDead", а после хила имее хп > 0
   * Значит накидываем хилеру 1 голды :)
   */
  // eslint-disable-next-line class-methods-use-this
  backToLife() {}

  /**
   * @param {Object} obj
   */
  breaks(obj) {
    const bl = this.params.game.battleLog;
    bl.log(obj);
  }

  /**
   * Функция вычисления размера хила
   * @return {Number} размер хила
   */
  effectVal() {
    const i = this.params.initiator;
    const proc = i.proc || 0;
    const eff = MiscService.randInt(i.stats.val('hl').min, i.stats.val('hl').max);
    return floatNumber(eff * proc);
  }

  /**
   * Пустая run
   */
  // eslint-disable-next-line class-methods-use-this
  run() {}

  /**
   * Функция положительного прохождения
   */
  next() {
    const { target } = this.params;
    const { initiator } = this.params;
    const bl = this.params.game.battleLog;
    bl.success({
      exp: this.status.exp,
      action: this.name,
      actionType: 'heal',
      target: target.nick,
      initiator: initiator.nick,
      effect: this.status.val,
    });
  }
}

module.exports = Heal;