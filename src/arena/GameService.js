const _ = require('lodash');
const BattleLog = require('./BattleLog');
const engineService = require('./engineService');
const db = require('../helpers/dataBase');
const channelHelper = require('../helpers/channelHelper');
/**
 * GameService
 *
 * @description Обработка около игровой логики
 * @module Service/Game
 * @todo сейчас после того как Player отлючился, socket выходит из room.
 * Нужен механизм подключения обратно, если клиент "обновил" страницу или
 * переподключился к игре после disconnect(разрыв соединения)
 */
const RoundService = require('./RoundService');
const PlayersArr = require('./playerArray');
const OrderService = require('./OrderService');

/**
 * Класс для обьекта игры
 */
class Game {
  /**
   * Конструктор обьекта игры
   *@param {Array} playerArr массив игроков
   */
  constructor(playerArr) {
    this.playerArr = new PlayersArr(playerArr);
    this.players = [];
    this.round = new RoundService();
    this.orders = new OrderService();
    this.battleLog = new BattleLog();
    this.longActions = {};
  }

  /**
   * Функция проверки окончания игры
   */
  get isGameEnd() {
    return Game.aliveArr(this.info.id).length < 2 || this.round.count > 4;
  }

  /**
   * Статик функция возвращающая массив живых игроков в игре
   * @param {Number} gameId идентификатор игры
   * @return {any[]} [PlayerID:{PlayerObjectPlayerObject},...] массив живых игроков
   */
  static aliveArr(gameId) {
    const game = global.arena.games[gameId];
    return _.filter(game.players, {
      alive: true,
    });
  }

  /**
   * Статик функция возвращающая массив живых игроков в игре
   * @param {Number} gameId идентификатор игры
   * @return {String} массив живых игроков
   */
  static randomAlive(gameId) {
    const aliveArr = Game.aliveArr(gameId);
    return aliveArr[Math.random() * aliveArr.length];
  }

  /**
   * Отправляет в чат кнопки с заказами
   * @param {Object} player - объект игрока
   */
  static showOrderButtons(player) {
    channelHelper.sendOrderButtons(player);
  }

  /**
   * Удаляет кнопки заказа в чате
   * @param {Object} player - объект игрока
   */
  static hideLastMessage(player) {
    channelHelper.removeMessages(player);
  }

  /**
   * Отправляет в чат кнопки с заказами
   * @param {Object} player - объект игрока
   */
  static showExitButton(player) {
    channelHelper.sendExitButton(player);
  }

  /**
   * Предзагрузка игры
   */
  preLoading() {
    this.info.status = 'preload';
    this.forAllAlivePlayers(Game.hideLastMessage);
    this.startGame();
    this.initHandlers();
    this.info.players.forEach((player) => {
      global.arena.players[player].mm = this.info.id;
    });
  }

  /**
   * Старт игры
   */
  startGame() {
    // eslint-disable-next-line no-console
    console.debug('GC debug:: startGame', 'gameId:', this.info.id);
    // рассылаем статусы хп команды и врагов
    this.sendToAll('Игра начинается');
    this.round.nextState();
  }

  /**
   * @description Отправляем event BattleLog все подключенным к игре
   * @param {Object} data Обьект содержащий {event,msg}
   *
   */
  sendBattleLog(data) {
    // eslint-disable-next-line no-console
    console.debug('GC debug:: SBL', 'gameId:', this.info.id, 'data:', data);
    channelHelper.broadcast(data);
  }

  /**
   * @param {Object} data Обьект содержащий {event,msg}
   */
  sendToAll(data) {
    // eslint-disable-next-line no-console
    console.debug('GC debug:: sendToAll', this.info.id);
    channelHelper.broadcast(data);
  }

  /**
   *@todo Остановка игры
   */
  pauseGame() {
    // eslint-disable-next-line no-console
    console.debug(this.info.id);
  }

  /**
   * @description Прекик, помечаем что пользователь не выполнил заказ и дальше
   * будет выброшен
   * @param {string} id id игрока, который будет помочен как бездействующий
   */
  preKick(id) {
    const player = this.players[id];
    // eslint-disable-next-line no-console
    if (!player) return console.log('GC debug:: preKick', id, 'no player');
    player.flags.isKicked = true;
  }

  /**
   * @description Функция "выброса игрока" из игры,
   * без сохранения накопленных статов
   * @param {string} id id игрока, который будет выброшен
   */
  kick(id) {
    const player = this.players[id];
    // eslint-disable-next-line no-console
    if (!player) return console.log('GC debug:: kick', id, 'no player');
    channelHelper.sendRunButton(player);
    channelHelper.broadcast(`Игрок ${this.players[id].nick} был выброшен из игры`);
    delete this.players[id];
    this.info.players.splice(this.info.players.indexOf(id), 1);
  }

  /**
   * Проверяем делал ли игрок заказ. Помечает isKicked, если нет
   * @param {object} player
   */
  checkOrders(player) {
    if (player.flags.isKicked) this.kick(player.id);

    player.flags.isKicked = !this.orders.checkPlayerOrder(player.id);
  }

  /**
   * @description Завершение игры
   *
   */
  endGame() {
    // eslint-disable-next-line no-console
    console.log('GC debug:: endGame', this.info.id);
    // Отправляем статистику
    this.sendBattleLog(this.statistic());
    this.saveGame();
    setTimeout(() => {
      this.sendToAll('Конец игры, распределяем ресурсы...');
      this.forAllPlayers(Game.showExitButton);
    }, 15000);
  }

  /**
   * Создание обьекта в базе // потребуется для ведения истории
   * @return {Object} Обьект созданный в базе
   */
  async createGame() {
    const dbGame = await db.game.create({
      players: this.playerArr.init,
    });
    this.players = await this.playerArr.roundJson();
    this.info = dbGame;
    this.info.id = this.info._id;
    return true;
  }

  /**
   * Возвращает обьект персонажа внутри игры [engine]
   * @param {string} id идентификатор чара
   * @return {Object} PlayerObj
   */
  getPlayerById(id) {
    return this.players[id];
  }

  /**
   * Сбрасываем всем игрокам кол-во доступных процентов на 100
   */
  resetProc() {
    // eslint-disable-next-line no-return-assign
    _.forEach(this.players, (p) => p.proc = 100);
  }

  /**
   * Подвес
   */
  initHandlers() {
    // Обработка сообщений от Round Module
    this.round.on('Round', async (data) => {
      switch (data.event) {
        case 'startRound': {
          // eslint-disable-next-line no-console
          console.log('Handler: ', data);
          this.sendToAll(`⚡️ Раунд ${data.round} начинается ⚡`);
          this.resetProc();
          this.orders.reset();
          this.forAllPlayers(this.sendStatus);
          break;
        }
        case 'endRound': {
          this.sortDead();
          this.refreshPlayer();
          // нужно вызывать готовые функции
          if (this.isGameEnd) {
            this.endGame();
          } else {
            this.round.goNext('starting', 500);
          }
          break;
        }
        case 'engine': {
          await engineService(this);
          break;
        }
        case 'orders': {
          channelHelper.broadcast('Пришло время делать заказы!');
          this.forAllAlivePlayers(Game.showOrderButtons);
          break;
        }
        case 'endOrders': {
          this.forAllAlivePlayers(Game.hideLastMessage);
          this.forAllPlayers(this.checkOrders);
          break;
        }
        default: {
          // eslint-disable-next-line no-console
          console.log('InitHandler:', data.event, 'undef event');
        }
      }
    });
    // Обработка сообщений от BattleLog Module
    // @todo пока прокидываем напрямую из battlelog
    this.battleLog.on('BattleLog', async (data) => {
      // eslint-disable-next-line no-console
      console.log('BattleLog:', data);
      this.sendBattleLog(data);
    });
  }

  /**
   * Метод сохраняющий накопленную статистику игроков в базу и сharObj
   * @todo нужен общий метод сохраниющий всю статистику
   */
  saveGame() {
    try {
      const charArr = global.arena.players;
      _.forEach(this.info.players, async (p) => {
        charArr[p].exp += this.players[p].stats.collect.exp;
        charArr[p].gold += this.players[p].stats.collect.gold;
        await charArr[p].saveToDb();
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Game:', e);
    }
  }

  /**
   * Функция послематчевой статистики
   * @return {String} возвращает строку статистики по всем игрокам
   */
  statistic() {
    const winners = Game.aliveArr(this.info.id);
    _.forEach(winners, (p) => p.stats.addGold(5));
    let res = `Статистика: игра ${this.info.id} `;
    _.forEach(this.players, (p) => {
      const s = p.stats.collect;
      res += `\nИгрок ${p.nick} получает ${s.exp} опыта и ${s.gold} золота`;
    });
    return res;
  }

  /**
   * Функция выставляет "смерть" для игроков имеющих hp < 0;
   */
  sortDead() {
    _.forEach(this.players, (p) => {
      if (p.stats.val('hp') <= 0) {
        p.alive = false;
      }
    });
  }

  /**
   * Сброс состояния игроков
   */
  refreshPlayer() {
    _.forEach(this.players, (p) => {
      p.stats.refresh();
      p.flags.refresh();
    });
  }

  /**
   * Интерфейс для работы со всеми игроками в игре
   * @param {function} f функция применяющая ко всем игрокам в игре
   */
  forAllPlayers(f) {
    _.forEach(this.players, (p) => f.call(this, p));
  }

  /**
   * Интерфейс для работы с живыми
   * @param {function} f функция применяющая
   */
  forAllAlivePlayers(f) {
    const aliveArr = _.filter(this.players, {
      alive: true,
    });
    aliveArr.forEach((p) => f.call(this, p));
  }

  /**
   * Рассылка состояний живым игрокам
   * @param {Player} player обьект игрока
   * @param {Game} game обьект игры
   */
  sendStatus(player) {
    const team = this.playerArr.getMyTeam(player.clan);
    if (_.isEmpty(team)) {
      team.push(player);
    }
    let enemies = _.difference(this.playerArr.arr, team);
    const allies = team.map((p) => {
      const ally = p.getFullStatus();
      return `\n\n👤 ${ally.nick} (${ally.prof}), ❤️: ${ally.hp}, 💙 : ${ally.mp}`;
    });
    enemies = enemies.map((p) => {
      const enemy = p.getStatus();
      return `\n\n👤 ${enemy.nick} (${p.prof}) ❤️: ${enemy.hp}`;
    });
    player.notify({ enemies, allies });
  }
}

module.exports = Game;
