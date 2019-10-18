const { EventEmitter } = require('events');
const GameService = require('./GameService');
const WatchService = require('./WatchService');

/**
 * MatchMaking system
 * @module Service/MatchMaking
 * @description Класс обьекта MM, для сбора игр
 * */

const { maxIter } = sails.config.arena;
const { roundPlayersLimit } = sails.config.arena;

/**
 * Общий класс обьекта MatchMaking
 */
class MatchMaking extends EventEmitter {
  /**
   * Пустой конструктор, предполагается что сам обьект будет 1н
   */
  constructor() {
    super();
    this.allQueue = []; // обьект очередей ! < 10
    this.mmQueue = [];
    this.prefs = {
      checkinterval: 10000,
    };
    this.timerId = undefined;
  }

  /**
   * Удаление обьекта игрока в очередь поиска
   * @param {Number} charId id чара в поиске
   */
  pull(charId) {
    const obj = this.mmQueue.find((el) => el.charId === charId);
    this.mmQueue.splice(this.mmQueue.indexOf(obj), 1);
    // @todo убрать просле дебага
    // eslint-disable-next-line no-console
    console.log('mm pull debug', this.mmQueue);
  }

  /**
   * Добавление обьекта игрока в очередь поиска
   *@param {Object} obj Обьект запроса поиска {charId,psr,startTime}
   */
  push(obj) {
    this.mmQueue.push(obj);
  }

  /**
   * Функция остановки системы подбора игроков
   * admin only
   */
  stop() {
    clearInterval(this.timerId);
  }

  /**
   * Основная функция запуска поиска внутри системы MatchMaking
   */
  start() {
    const _this = this;
    this.timerId = setInterval(() => {
      _this.main();
    }, _this.prefs.checkinterval);
  }

  /**
   * Основная функци работы с очередями
   */
  main() {
    let iter = 0;
    let queue;
    while ((this.mmQueue.length >= 2) && (iter < maxIter)) {
      const mmLength = this.mmQueue.length - 1;
      for (let i = mmLength; i >= 0; i--) {
        // @todo нужно перейти на lodash
        const searcher = this.mmQueue[i];
        if (!searcher) break;
        // пробуем перебрать польз из очереди в одну из уже созданных очередей
        if (this.allQueue.length > 10) {
          // сюда нужна функция чистки allQueue от уже собранных очередей.
          // eslint-disable-next-line no-console
          console.debug('length>10');
          for (const xx in this.allQueue) {
            if (!this.allQueue[xx].open) {
              this.allQueue.splice(xx, 1);
            }
          }
        } else {
          queue = this.allQueue.find((qu) => (qu.policy(searcher) && qu.open));
          if (!queue) {
            queue = new Queue();
            this.allQueue.push(queue);
          }
          queue.addTo(searcher);
          this.pull(searcher);
        }
      }
      iter += 1;
    }
  }
}

/**
 * Конструктор обьекта очереди
 */
class Queue {
  /**
   * Конструтор пустой очереди
   */
  constructor() {
    this.psr = 0;
    this.players = [];
    this.open = true;
  }

  /**
   * Добавление чара в предсобранную комнату для игры
   * @param {Object} searcherObj Обьект чара начавшего поиск
   */
  async addTo(searcherObj) {
    try {
      this.players.push(searcherObj);
      if (this.checkStatus()) {
        this.open = false;
        await this.goStartGame();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  /**
   * Описание политики обьекта очереди
   * @param {Object} searcherObj
   * @return {Boolean}
   */
  policy(searcherObj) {
    const playerPsr = searcherObj.psr;
    return (!this.length) || (playerPsr > (this.psr / this.length + 50));
  }

  /**
   * Возвращает достигнут ли лимит игроков в очереди
   * @return {Boolean}
   */
  checkStatus() {
    // Проверяем не собралась ли уже у нас очередь ?
    return this.players.length >= roundPlayersLimit;
  }

  /**
   * Функция создания обьекта игры после того как достаточное кол-во игроков,
   * уже найдено в игру.
   */
  async goStartGame() {
    try {
      const newGame = new GameService(this.players.map((pl) => pl.charId));
      await newGame.createGame();
      WatchService.take(newGame);
      this.open = false;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
}

module.exports = MatchMaking;
