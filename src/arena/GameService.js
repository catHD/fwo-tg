const _ = require('lodash');
const BattleLog = require('./BattleLog');
const engineService = require('./engineService');
const db = require('../helpers/dataBase');
const channelHelper = require('../helpers/channelHelper');
const testGame = require('./testGame');
const arena = require('./index');
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
const HistoryService = require('./HistoryService');
const { charDescr } = require('./MiscService');

/**
 * Класс для обьекта игры
 * @typedef {import ('./PlayerService')} Player
 */
class Game {
  /**
   * Конструктор обьекта игры
   * @param {Array} playerArr массив игроков
   */
  constructor(playerArr) {
    this.playerArr = new PlayersArr(playerArr);
    /** @type {Object<string, Player>} */
    this.players = {};
    this.round = new RoundService();
    this.orders = new OrderService();
    this.battleLog = new BattleLog();
    this.history = new HistoryService();
    this.longActions = {};
  }

  /**
   * Функция проверки окончания игры
   * @return {boolean}
   */
  get isGameEnd() {
    return (
      this.alivePlayers.length < 2
      || this.round.flags.noDamageRound > 2
      || this.round.count > 9
    );
  }

  get endGameReason() {
    const base = 'Игра завершена.';
    if (this.round.flags.noDamageRound > 2) {
      return `${base} Причина: 3 рауда подряд никто из участников не наносил урона`;
    }
    return base;
  }

  /**
   * Возвращает массив мёртвых игроков
   * @return {Player[]}
   */
  get deadPlayers() {
    return _.filter(this.players, {
      alive: false,
    });
  }

  /**
   * Возвращает массив живых игроков
   * @return {Player[]}
   */
  get alivePlayers() {
    return _.filter(this.players, {
      alive: true,
    });
  }

  get checkRoundDamage() {
    return !!this.history.getRoundDamage(this.round.count).length;
  }

  /**
   * Статик функция возвращающая массив живых игроков в игре
   * @param {Number} gameId идентификатор игры
   * @return {Player[]} массив живых игроков
   */
  static aliveArr(gameId) {
    const game = arena.games[gameId];
    return _.filter(game.players, {
      alive: true,
    });
  }

  /**
   * Отправляет в чат кнопки с заказами
   * @param {Player} player - объект игрока
   */
  static showOrderButtons(player) {
    channelHelper.sendOrderButtons(player);
  }

  /**
   * Удаляет кнопки заказа в чате
   * @param {Player} player - объект игрока
   */
  static hideLastMessage(player) {
    channelHelper.removeMessages(player);
  }

  /**
   * Отправляет в чат кнопки с заказами
   * @param {Player} player - объект игрока
   */
  static showExitButton(player) {
    channelHelper.sendExitButton(player);
  }

  /**
   * Проверяет являются ли игроки союзниками
   * @param {Player} player
   * @param {Player} target
   */
  isPlayersAlly(player, target) {
    const allies = this.playerArr.getMyTeam(player.clan);
    if (!allies.length) {
      allies.push(player);
    }
    return allies.some((ally) => ally.id === target.id);
  }

  /**
   * Предзагрузка игры
   */
  preLoading() {
    this.info.status = 'preload';
    this.forAllAlivePlayers(Game.hideLastMessage);
    this.initHandlers();
    this.startGame();

    arena.games[this.info.id] = this;

    this.info.players.forEach((playerId) => {
      arena.characters[playerId].gameId = this.info.id;
    });
    // @todo add statistic +1 game for all players
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
   * @param {String} data строка, отправляемая в общий чат
   *
   */
  sendBattleLog(data) {
    // eslint-disable-next-line no-console
    console.debug('GC debug:: SBL', 'gameId:', this.info.id, 'data:', data);
    channelHelper.broadcast(data);
  }

  /**
   * @param {String} data строка, отправляемая в общий чат
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
   * Прекик, помечаем что пользователь не выполнил заказ и дальше будет выброшен
   * @param {string} id id игрока, который будет помочен как бездействующий
   * @param {'afk' | 'run'} reason строка, подставляющаяся в флаг isKicked
   */
  preKick(id, reason) {
    const player = this.players[id];
    // eslint-disable-next-line no-console
    if (!player) return console.log('GC debug:: preKick', id, 'no player');
    player.flags.isKicked = reason;
  }

  /**
   * Функция "выброса игрока" из игры без сохранения накопленных статов
   * @param {string} id id игрока, который будет выброшен
   * @param {'afk' | 'run'} [reason] причина кика
   */
  kick(id, reason) {
    const player = this.players[id];
    // eslint-disable-next-line no-console
    if (!player) return console.log('GC debug:: kick', id, 'no player');
    channelHelper.sendRunButton(player);
    if (reason === 'run') {
      channelHelper.broadcast(`Игрок *${player.nick}* сбежал из боя`);
    } else {
      channelHelper.broadcast(`Игрок *${player.nick}* был выброшен из игры`);
    }
    arena.characters[id].autoreg = false;
    delete this.players[id];
    this.info.players.splice(this.info.players.indexOf(id), 1);
  }

  /**
   * Проверяем делал ли игрок заказ. Помечает isKicked, если нет
   * @param {Player} player
   */
  checkOrders(player) {
    if (!player.alive) {
      return;
    }

    if (player.flags.isKicked === 'run') {
      this.kick(player.id, player.flags.isKicked);
      return;
    }

    if (player.flags.isKicked === 'afk' && !this.orders.checkPlayerOrder(player.id)) {
      this.kick(player.id, player.flags.isKicked);
    } else {
      player.flags.isKicked = this.orders.checkPlayerOrder(player.id) ? '' : 'afk';
    }
  }

  /**
   * Ставим флаги, влияющие на окончание игры
   */
  handleEndGameFlags() {
    if (this.checkRoundDamage) {
      this.round.flags.noDamageRound = 0;
    } else {
      this.round.flags.noDamageRound += 1;
    }
  }

  addHistoryDamage(dmgObj) {
    this.history.addDamage(dmgObj, this.round.count);
  }

  /**
   * @description Завершение игры
   *
   */
  endGame() {
    // eslint-disable-next-line no-console
    console.log('GC debug:: endGame', this.info.id);
    // Отправляем статистику
    this.sendBattleLog(this.endGameReason);
    this.sendBattleLog(this.statistic());
    this.saveGame();
    setTimeout(() => {
      this.sendToAll('Конец игры, распределяем ресурсы...');
      this.forAllPlayers(Game.showExitButton);
      this.forAllPlayers((player) => { arena.characters[player.id].gameId = null; });
      arena.mm.cancel();
      this.forAllPlayers(/** @param {Player} player */(player) => arena.mm.autoreg(player.id));
    }, 15000);
  }

  /**
   * Создание обьекта в базе // потребуется для ведения истории
   * @return {Promise<true>} Обьект созданный в базе
   */
  async createGame() {
    const dbGame = await db.game.create({
      players: this.playerArr.init,
    });
    this.players = await this.playerArr.roundJson();
    this.info = dbGame;
    this.info.id = this.info._id;
    this.preLoading();
    return true;
  }

  /**
   * Возвращает обьект персонажа внутри игры [engine]
   * @param {string} id идентификатор чара
   * @return {Player} PlayerObj
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
  * Очищаем глобальные флаги в бою
  * затмение, бунт богов, и т.п
  */
  refreshRoundFlags() {
    this.round.flags.global = {};
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
          this.handleEndGameFlags();
          // нужно вызывать готовые функции
          if (this.isGameEnd) {
            this.endGame();
          } else {
            this.refreshPlayer();
            this.refreshRoundFlags();
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
          // Debug Game Hack
          if (this.players['5e05ee58bdf83c6a5ff3f8dd']) {
            this.orders.ordersList = this.orders.ordersList.concat(testGame.orders);
          }
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
      _.forEach(this.info.players, async (p) => {
        arena.characters[p].exp += this.players[p].stats.collect.exp;
        arena.characters[p].gold += this.players[p].stats.collect.gold;
        await arena.characters[p].saveToDb();
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Game:', e);
    }
  }

  /**
   * Функция послематчевой статистики
   * @return {string} возвращает строку статистики по всем игрокам
   */
  statistic() {
    this.giveGoldforKill();
    const winners = this.alivePlayers;
    const gold = this.deadPlayers.length ? 5 : 1;
    winners.forEach((p) => p.stats.addGold(gold));
    let res = `Статистика: игра ${this.info.id} `;
    _.forEach(this.players, (p) => {
      const s = p.stats.collect;
      res += `\nИгрок ${p.nick} получает ${s.exp} опыта и ${s.gold} золота`;
    });
    return res;
  }

  /**
  * Функция пробегает всех убитых и раздает золото убийцам
  */
  giveGoldforKill() {
    const deadArray = this.deadPlayers;
    _.forEach(deadArray, (p) => {
      const killer = this.getPlayerById(p.flags.isDead);
      if (killer) killer.stats.addGold(5 * p.lvl);
    });
  }

  /**
   * Функция выставляет "смерть" для игроков имеющих hp < 0;
   * Отсылает сообщение о смерти игрока в последнем раунде
   * @todo сообщение о смерти как-то нормально нужно сделать,
   * чтобы выводило от чего и от кого умер игрок
   */
  sortDead() {
    const dead = [];
    _.forEach(this.players, (p) => {
      if (p.stats.val('hp') <= 0 && p.alive) {
        dead.push(p.nick);
        p.alive = false;
      }
    });
    this.cleanLongMagics();
    if (dead.length) {
      this.sendToAll(`Погибши${
        dead.length === 1 ? 'й' : 'е'
      } в этом раунде: ${
        dead.join(', ')
      }`);
    }
  }
  /**
  * Очистка массива длительных магий от умерших
  */
  cleanLongMagics() {
    /**
    * Очищаем массив длительных магий для мертвецов
{
    frostTouch: [
    {
      initiator: '5ea330784e5f0354f04edcec',
      target: '5e05ee58bdf83c6a5ff3f8dd',
      duration: 0,
      round: 1,
      proc: 1
    }
  ]
}
    */
    const _this = this;
    _.forEach(this.longActions,(longMagicType,k) => {
      _this.longActions[k] = _.filter(longMagicType, (act) => {
        const p = _this.getPlayerById(act.target) || {};
        return p.alive;
      });
    });
    this.longActions = _this.longActions;
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
   * @param {function(Player): void} f функция применяющая ко всем игрокам в игре
   */
  forAllPlayers(f) {
    _.forEach(this.players, (p) => f.call(this, p));
  }

  /**
   * Интерфейс для работы с живыми
   * @param {function(Player): void} f функция применяющая
   */
  forAllAlivePlayers(f) {
    this.alivePlayers.forEach((p) => f.call(this, p));
  }

  /**
   * Рассылка состояний живым игрокам
   * @param {Player} player обьект игрока
   */
  sendStatus(player) {
    const team = this.playerArr.getMyTeam(player.clan);
    if (_.isEmpty(team)) {
      team.push(player);
    }
    let enemies = _.difference(this.playerArr.arr, team);
    const allies = team.map((p) => {
      const status = p.getFullStatus();
      const { icon } = Object.values(charDescr).find((el) => el.prof === p.prof);
      if (p.prof === 'l' || p.prof === 'w') {
        return `\n\t👤 ${p.nick} (${icon}${p.lvl}) ❤️${status.hp} 🔋${status.en}`;
      }
      return `\n\t👤 ${p.nick} (${icon}${p.lvl}) ❤️${status.hp}  \n\t💧${status.mp}  🔋${status.en}`;
    });
    enemies = enemies.map((p) => {
      const status = p.getStatus();
      const { icon } = Object.values(charDescr).find((c) => c.prof === p.prof);
      return `\n\t👤 ${p.nick} (${icon}${p.lvl}) ❤️${status.hp}`;
    });
    channelHelper.sendStatus(
      `*Раунд ${this.round.count}*
_Союзники:_\`\`\`
${allies}\`\`\`
_Враги:_\`\`\`
${enemies}\`\`\`
`,
      player.tgId,
    );
  }
}

module.exports = Game;
