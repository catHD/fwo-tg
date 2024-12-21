import config from '@/arena/config';
import GameService from '@/arena/GameService';
import type { MatchMakingItem } from '@/arena/MatchMakingService';

/**
 * Конструктор объекта очереди
 */
class QueueConstructor {
  psr = 0;
  open = true;
  players: MatchMakingItem[];
  /**
   * Конструтор пустой очереди
   * @param {mmObj[]} searchers
   */
  constructor(searchers: MatchMakingItem[]) {
    this.players = searchers;
  }

  /**
   * Добавление чара в предсобранную комнату для игры
   * @param searcherObj Объект чара начавшего поиск
   */
  async addTo(searcherObj: MatchMakingItem) {
    try {
      this.players.push(searcherObj);
      if (this.checkStatus()) {
        this.open = false;
        await this.goStartGame();
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Описание политики объекта очереди
   * @param searcherObj
   * @return {Boolean}
   */
  policy(searcherObj: MatchMakingItem) {
    const playerPsr = searcherObj.psr;
    return !this.players.length || playerPsr > this.psr / this.players.length + 50;
  }

  /**
   * Возвращает достигнут ли лимит игроков в очереди
   * @return {Boolean}
   */
  checkStatus() {
    // Проверяем не собралась ли уже у нас очередь ?
    return this.players.length >= config.minPlayersLimit;
  }

  /**
   * Функция создания объекта игры после того как достаточное кол-во игроков,
   * уже найдено в игру.
   */
  async goStartGame() {
    try {
      const newGame = new GameService(this.players.map((pl) => pl.id));
      const id = await newGame.createGame();
      this.open = false;
      return id;
    } catch (e) {
      console.error(e);
    }
  }
}

export default QueueConstructor;
