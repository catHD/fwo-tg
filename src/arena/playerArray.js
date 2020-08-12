const _ = require('lodash');
const { default: PlayerService } = require('./PlayerService');

/**
 * Класс контроля игроков внутри созданной игры
 * @typedef {import ('./PlayerService').default} Player
 * @typedef {import ('../models/clan').Clan} Clan
 */
class PlayersArr {
  /**
   * Конструктор обьекта
   * @param {String[]} arr [charId,charId,...]
   */
  constructor(arr) {
    this.init = arr;
    /** @type {Player[]} */
    this.arr = [];
  }

  /**
   * round_json
   * @description JSON пользователей нужно хратить в определенном формате
   * @return {Promise<Object<string, Player>>} userjson Обьект на начало игры
   * @todo переделать это, убрать внутрь конструктора playersArr
   */
  async roundJson() {
    const result = await Promise.all(
      this.init.map((p) => PlayerService.loading(p)),
    );
    this.arr = result;
    return _.keyBy(result, 'id');
  }

  /**
   * Функция вернет массив игроков в моей тиме
   * @param {Clan} clan объект клана
   * @returns {Player[]}
   */
  getMyTeam(clan) {
    if (!clan || !clan.id) return [];
    return this.arr.filter((p) => p.clan && p.clan.id === clan.id);
  }

  /**
  * Функция возвращает рандомного игрока из массива живых
  * @return {Player}
  */
  get randomAlive() {
    const alive = _.filter(this.arr, {
      alive: true,
    });
    return alive[Math.floor(Math.random() * alive.length)];
  }
}

module.exports = PlayersArr;
