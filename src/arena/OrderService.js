const pullAllWith = require('lodash.pullallwith');
const isEqual = require('lodash.isequal');
// const MiscService = require('./MiscService');
// const GameService = require('./GameService');
const arena = require('./index');

/**
 * @typedef {Object} order - объект заказа
 * @property {String} initiator инициатор
 * @property {String} target цель действия
 * @property {String} action действие
 * @property {Number} proc процент действия
 */

/**
 * @desc проверка достижения максимального кол-ва целей при атаке
 * @param {String} charId идентификатор персонажа
 * @returns {Boolean}
 * @todo
 */
function isMaxTargets(charId) {
  return !!charId;
}

/**
 * @desc Проверка доступно ли действие для персонажа
 * @param {String} action идентификатор действия
 * @returns {Boolean}
 * @todo
 */
function isValidAct(action) {
  return !!action;
}

/**
 * OrderService
 *
 * @description Сервис обработки входящих заказов игроков
 * @module Service/Order
 * @todo Нужно доработать структуру и Error
 * @todo для скиллов нужна жесткая проверка заказанных процентов
 */
class Orders {
  /**
   * Конструктор обьекта заказов внутри раунда
   */
  constructor() {
    /** @type {order[]} */
    this.ordersList = [];
    this.hist = {};
  }

  /**
   * @desc Функция приёма заказов
   * @param {order} order объект заказа
   * @example
   * {
   *  initiator: '123abc',
   *  target: 'abc123',
   *  proc: 10,
   *  action: 'handsHeal',
   * }
   * @throws {Error}
   */
  orderAction({
    initiator, target, action, proc,
  }) {
    // eslint-disable-next-line no-console
    console.log('orderAction >', initiator);

    // формируем список заказа для charId

    const gameId = arena.characters[initiator].mm;
    const Game = arena.games[gameId];
    // @todo Нужны константы для i18n
    if (!Game) {
      throw Error('Вы не в игре');
    } else if (Game.round.status !== 'orders') {
      throw Error('Раунд ещё не начался');
      // @todo тут надо выбирать из живых целей
    } else if (!Game.players[target].alive) {
      throw Error('Нет цели или цель мертва');
    } else if (Number(proc) > Game.players[initiator].proc) {
      throw Error('Нет процентов');
      // тут нужен геттер из Player
    } else if (!isMaxTargets(initiator)) {
      throw Error('Слишком много целей');
    } else if (!isValidAct(action)) {
      throw Error(`action spoof:${action}`);
    }
    // временный хак для атаки руками
    // @todo нужно дописать структуру атаки руками
    /** @type {order} */
    const a = {
      initiator, target, action, proc,
    };
    // if (action === 'attack') {
    //   a.hand = 'righthand';
    // }
    Game.players[initiator].proc -= proc;
    // eslint-disable-next-line no-console
    console.log('order :::: ', a);
    this.ordersList.push(a);
  }

  /**
   * Функция отмены всех действия цели
   * @param {String} charId идентификатор игрока
   */
  block(charId) {
    this.ordersList = pullAllWith(this.ordersList, [
      {
        initiator: charId,
      }], isEqual);
    // eslint-disable-next-line no-console
    console.log('block order', this.ordersList);
  }

  /**
   * Очищаем массив заказов
   */
  reset() {
    const keys = Object.keys(this.hist);
    const lastKey = keys[keys.length - 1];
    this.hist[lastKey + 1] = this.ordersList;
    if (!this.testOrdersList) {
      this.ordersList = [];
    } else {
      this.ordersList = this.testOrdersList;
    }
  }

  /**
   * Проверяет делал ли игрок заказ. Опционально проверяет название магии или умения в заказе
   * @param {string} charId идентификатор персонажа
   * @param {string} [act] название умения или магии
   * @returns {boolean}
   */
  checkPlayerOrder(charId, act) {
    return this.ordersList.some((o) => o.initiator === charId && (act ? o.action === act : true));
  }

  /**
   * Возвращает количество заказов игрока для данного умения
   * @param {String} charId идентификатор персонажа
   * @param {string} action название умения или магии
   * @returns {number} количество заказов игрока для данного умения
   */
  getNumberOfOrder(charId, action) {
    return this.ordersList.filter((o) => o.initiator === charId && o.action === action).length;
  }
}

module.exports = Orders;
