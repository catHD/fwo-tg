import { EventEmitter } from 'node:events';
import _ from 'lodash';
import config from './config';
import QueueConstructor from './Constuructors/QueueConstrucror';
import arena from './index';

/**
 * MatchMaking system
 * @module Service/MatchMaking
 * @description Класс объекта MM, для сбора игр
 * */

export type MatchMakingItem = {
  charId: string
  psr: number
  startTime: number
}
/**
 * Общий класс объекта MatchMaking
 */
class MatchMaking extends EventEmitter {
  allQueue: QueueConstructor[] = [];
  mmQueue: MatchMakingItem[] = [];
  timerId?: NodeJS.Timer;

  checkStatus() {
    const [withClans] = _.partition(this.mmQueue, (mmObj) => arena.characters[mmObj.charId].clan);
    const clans = _.groupBy(withClans, (mmObj) => arena.characters[mmObj.charId].clan?.id);
    const isEveryEnemy = Object.values(clans).every((c) => c.length <= this.mmQueue.length / 2);
    return this.mmQueue.length >= config.minPlayersLimit && isEveryEnemy;
  }

  /**
   * Удаление объекта игрока в очередь поиска
   * @param {String} charId id чара в поиске
   */
  pull(charId) {
    const obj = this.mmQueue.find((el) => el.charId === charId);
    if (obj) {
      this.mmQueue.splice(this.mmQueue.indexOf(obj), 1);
      this.main();
    }
    // @todo убрать после дебага
    console.log('MM pull debug', this.mmQueue);
  }

  /**
   * Добавление объекта игрока в очередь поиска
   * @param {mmObj} obj Объект запроса поиска {charId,psr,startTime}
   */
  push(obj) {
    this.mmQueue.push(obj);
    this.main();
  }

  /**
   * Функция остановки системы подбора игроков
   * admin only
   */
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  /**
   * Чистим очередь
   */
  clean() {
    this.allQueue.forEach((queue, i) => {
      if (!queue.open) {
        this.allQueue.splice(i, 1);
      }
    });
  }

  /**
   * Добавляем игроков в комнату
   */
  start() {
    if (!this.allQueue.length) {
      const queue = new QueueConstructor(this.mmQueue.splice(0, config.maxPlayersLimit));
      if (queue.checkStatus()) {
        this.allQueue.push(queue);
        void queue.goStartGame();
      }
    }
  }

  /**
   * Запускаем очистку и создаём новую очередь
   */
  cancel() {
    this.clean();
    this.main();
  }

  /**
   * Основная функции работы с очередями
   */
  main() {
    this.stop();
    if (this.checkStatus()) {
      this.timerId = setTimeout(() => { this.start(); }, config.startGameTimeout);
    }
  }
}

export default new MatchMaking();
