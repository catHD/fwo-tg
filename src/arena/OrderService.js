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
    this.ordersList = [];
    this.hist = {};
  }

  /**
   * @desc Функция приёма заказов
   * @param {Number} charId инициатор
   * @param {Number} target цель действия (charId)
   * @param {String} action действие
   * @param {Number} atcproc процент действия
   */
  orderAction(charId, target, action, atcproc) {
    sails.log('orderAction >', charId);
    /**
     * initiator: '1',
     * target: '1',
     * proc: 10,
     * action: 'handsHeal',
     */
    if (_.isObject(action)) {
      action = action.name;
    }
    // формируем список заказа для ника
    let Game = CharacterService.getGameFromCharId(charId);
    // @todo Нужны константы для i18n
    if (!Game) {
      throw Error('Вы не в игре');
    } else if (Game.round.status !== 'orders') {
      throw Error('Раунд ещё не начался');
      // @todo тут надо выбирать из живых целей
    } else if (!Game.players[target].alive) {
      throw Error('Нет цели или цель мертва');
    } else if (Number(atcproc) > Game.players[charId].proc) {
      throw Error('Нет процентов');
      // тут нужен геттер из Player
    } else if (!isMaxTargets(charId)) {
      throw Error('Слишком много целей');
    } else if (isValidAct(action)) {
      // временный хак для атаки руками
      // @todo нужно дописать структуру атаки руками
      let a = {
        initiator: charId, target: target, action: action, proc: atcproc,
      };
      // if (action === 'attack') {
      //   a.hand = 'righthand';
      // }
      Game.players[charId].proc -= atcproc;
      sails.log('order :::: ', a);
      this.ordersList.push(a);
    } else {
      sails.log.error('action spoof:', action);
    }
  }

  /**
   * Функция смены цели заказа target
   * Смена производится на все типы кроме магий
   * @param {String} charId имя заказывающешо
   * @param {String} reason причина смена цели пока здесь название action
   * @todo возможно в reason на ещё понадобится инициатор
   */
  shuffle(charId, reason) {
    if (charId) {
      // ord - обьект заказа
      this.ordersList.forEach((ord) => {
        let initiator = ord.initiator.id;
        let action = ord.action;
        if (!MiscService.isMagic(action) && initiator === charId) {
          ord.target = GameService.randomAlive(ord.initiator.getGameId());
        }
      });
    } else {
      this.ordersList.forEach((ord) => {
        let action = ord.action;
        if (!MiscService.isMagic(action)) {
          ord.target = GameService.randomAlive(ord.initiator.getGameId());
        }
      });
    }
  }

  /**
   * Функция отмены всех действия цели
   * @param {String} charId имя заказывающешо
   */
  block(charId) {
    this.ordersList = _.pullAllWith(this.ordersList, [
      {
        initiator: charId,
      }], _.isEqual);
    sails.log('block order', this.ordersList);
  }

  /**
   * Очищаем массив заказов
   */
  reset() {
    let lastKey = _.findLastKey(this.hist);
    this.hist[lastKey + 1] = this.ordersList;
    if (!this.testOrdersList) {
      this.ordersList = [];
    } else {
      this.ordersList = this.testOrdersList;
    }
  }
}

/**
 * @desc проверка достижения максимального кол-ва целей при атаке
 * @param {Number} charId идентификатор [charId]
 * @return {Boolean}
 */
function isMaxTargets(charId) {
  return true;
}

/**
 * @desc Проверка доступно ли действие для персонажа
 * @param {String} action идентификатор действия
 * @return {Boolean}
 * @todo
 */
function isValidAct(action) {
  return true;
}

module.exports = Orders;