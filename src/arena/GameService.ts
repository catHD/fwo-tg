import { createGame } from '@/api/game';
import type { Game } from '@/models/game';
import type { LongItem } from '@/arena/Constuructors/LongMagicConstructor';
import { engine } from '@/arena/EngineService';
import { HistoryService, type HistoryItem } from '@/arena/HistoryService';
import { LogService } from '@/arena/LogService';
import type * as magics from '@/arena/magics';
import OrderService from '@/arena/OrderService';
import PlayersService, { type Player } from '@/arena/PlayersService';
import { RoundService, RoundStatus } from '@/arena/RoundService';
import testGame from '@/arena/testGame';
import arena from '@/arena';
import { mapValues } from 'es-toolkit';
import EventEmitter from 'node:events';
import { noClanName } from './ClanService';
import type { GameStatus, PublicGameStatus } from '@fwo/schemas';

export type KickReason = 'afk' | 'run';

export interface GlobalFlags {
  isEclipsed?: boolean;
}

/**
 * GameService
 *
 * @description Обработка около игровой логики
 * @module Service/Game
 * @todo сейчас после того как Player отключился, socket выходит из room.
 * Нужен механизм подключения обратно, если клиент "обновил" страницу или
 * переподключился к игре после disconnect(разрыв соединения)
 */

/**
 * Класс для объекта игры
 */
export default class GameService extends EventEmitter<{
  end: [
    {
      reason: string | undefined;
      statistic: Partial<Record<string, { exp: number; gold: number }[]>>;
    },
  ];
  startOrders: [];
  endOrders: [];
  preKick: [{ reason: string; player: Player }];
  kick: [{ reason: string; player: Player }];
  startRound: [
    { round: number; status: GameStatus[]; statusByClan: Record<string, PublicGameStatus[]> },
    scope: string,
  ];
  endRound: [{ dead: Player[]; log: HistoryItem[] }];
}> {
  players: PlayersService;
  orders: OrderService;
  round = new RoundService();
  logger = new LogService();
  history = new HistoryService();
  longActions: Partial<Record<keyof typeof magics, LongItem[]>> = {};
  info!: Game;
  flags: {
    noDamageRound: number;
    global: GlobalFlags;
  };

  /**
   * Конструктор объекта игры
   * @param players массив игроков
   */
  constructor(players: string[]) {
    super();

    this.players = new PlayersService(players);
    this.orders = new OrderService(this.players, this.round);
    this.flags = {
      noDamageRound: 0,
      global: {},
    };
  }

  /**
   * Функция проверки окончания игры
   */
  get isGameEnd(): boolean {
    return (
      this.isTeamWin ||
      this.players.alivePlayers.length === 0 ||
      this.flags.noDamageRound > 2 ||
      this.round.count > 9
    );
  }

  get isTeamWin(): boolean {
    const { [noClanName]: noClan, ...groupByClan } = this.players.groupByClan(
      this.players.alivePlayers,
    );
    if (!noClan?.length) {
      return Object.keys(groupByClan).length === 1;
    }
    return noClan.length === 1 && !Object.keys(groupByClan).length;
  }

  getEndGameReason() {
    if (this.flags.noDamageRound > 2) {
      return 'noDamageRound';
    }
  }

  get checkRoundDamage(): boolean {
    return !!this.history.hasDamageForRound(this.round.count);
  }

  /**
   * Предзагрузка игры
   */
  preLoading(): void {
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
  startGame(): void {
    console.debug('GC debug:: startGame', 'gameId:', this.info.id);
    this.round.initRound();
  }

  /**
   *@todo Остановка игры
   */
  pauseGame(): void {
    console.debug(this.info.id);
  }

  /**
   * Прекик, помечаем что пользователь не выполнил заказ и дальше будет выброшен
   * @param id id игрока, который будет помочен как бездействующий
   * @param reason строка, подставляющаяся в флаг isKicked
   */
  preKick(id: string, reason: KickReason): void {
    const player = this.players.getById(id);
    if (!player) {
      console.log('GC debug:: preKick', id, 'no player');
      return;
    }
    player.preKick(reason);
    this.emit('preKick', { reason, player });
  }

  /**
   * Функция "выброса игрока" из игры без сохранения накопленных статов
   * @param id id игрока, который будет выброшен
   * @param reason причина кика
   */
  kick(id: string, reason: KickReason): void {
    const player = this.players.getById(id);
    if (!player) {
      console.log('GC debug:: kick', id, 'no player');
      return;
    }

    this.emit('kick', { reason, player });

    const char = arena.characters[id];
    char.addGameStat({ runs: 1 });
    void char.saveToDb();
    char.autoreg = false;
    this.players.kick(id);
    this.info.players.splice(this.info.players.indexOf(id), 1);
  }

  /**
   * Проверяем делал ли игрок заказ. Помечает isKicked, если нет
   * @param player
   */
  checkOrders(player: Player): void {
    if (!player.alive || this.round.count === 1) {
      return;
    }

    if (player.flags.isKicked === 'run') {
      this.kick(player.id, player.flags.isKicked);
      return;
    }

    if (!this.orders.checkPlayerOrderLastRound(player.id)) {
      if (player.flags.isKicked === 'afk') {
        this.kick(player.id, 'afk');
      } else {
        this.preKick(player.id, 'afk');
      }
    } else {
      /** @todo create clear kick flag method */
      player.preKick(undefined);
    }
  }

  /**
   * Ставим флаги, влияющие на окончание игры
   */
  handleEndGameFlags(): void {
    if (this.checkRoundDamage) {
      this.flags.noDamageRound = 0;
    } else {
      this.flags.noDamageRound += 1;
    }
  }

  recordOrderResult(item: HistoryItem) {
    this.history.addHistoryForRound(item, this.round.count);
  }

  getLastRoundResults() {
    return this.history.getHistoryForRound(this.round.count - 1);
  }

  getRoundResults() {
    return this.history.getHistoryForRound(this.round.count);
  }

  /**
   * @description Завершение игры
   *
   */
  endGame(): void {
    console.log('GC debug:: endGame', this.info.id);
    // Отправляем статистику
    setTimeout(() => {
      this.emit('end', { reason: this.getEndGameReason(), statistic: this.statistic() });
      this.removeAllListeners();
      this.saveGame();
      // }, 5000);
      // setTimeout(() => {
      arena.mm.cancel();

      this.forAllPlayers((player: Player) => {
        arena.characters[player.id].gameId = '';
      });
      // FIXME move to client side
      this.forAllPlayers((player: Player) => {
        const char = arena.characters[player.id];
        if (char.expEarnedToday >= char.expLimitToday) {
          char.autoreg = false;
        }
        if (!char.autoreg) return;
        arena.mm.push({
          id: player.id,
          psr: 1000,
          startTime: Date.now(),
        });
      });
    }, 5000);
  }

  /**
   * Создание объекта в базе // потребуется для ведения истории
   * @return Объект созданный в базе
   */
  async createGame() {
    try {
      const dbGame = await createGame(this.players.init);
      this.info = dbGame;
      this.info.id = this.info._id.toString();
      return this;
    } catch (e) {
      console.log('GC debug:: createGame', e);
    } finally {
      this.preLoading();
    }
  }

  /**
   * Очищаем глобальные флаги в бою
   * затмение, бунт богов, и т.п
   */
  refreshRoundFlags(): void {
    this.flags.global = {};
  }

  /**
   * Подвес
   */
  initHandlers(): void {
    // Обработка сообщений от Round Module
    this.round.subscribe(({ state, round }) => {
      switch (state) {
        case RoundStatus.START_ROUND: {
          this.forAllPlayers(this.checkOrders);
          this.sendStatus(round);
          break;
        }
        case RoundStatus.END_ROUND: {
          this.emit('endRound', { dead: this.sortDead(), log: this.getRoundResults() });
          this.players.reset();
          this.orders.reset();
          this.handleEndGameFlags();
          if (this.isGameEnd) {
            this.round.unsubscribe();
            this.endGame();
          } else {
            this.refreshRoundFlags();
            this.round.nextRound();
          }
          break;
        }
        case RoundStatus.ENGINE: {
          engine(this);
          break;
        }
        case RoundStatus.START_ORDERS: {
          this.emit('startOrders');
          break;
        }
        case RoundStatus.END_ORDERS: {
          this.emit('endOrders');
          // Debug Game Hack
          if (process.env.NODE_ENV === 'development') {
            this.orders.ordersList = this.orders.ordersList.concat(testGame.orders);
          }
          break;
        }
        default: {
          console.log('InitHandler:', state, 'undef event');
        }
      }
    });
  }

  /**
   * Метод сохраняющий накопленную статистику игроков в базу и сharObj
   * @todo нужен общий метод сохраняющий всю статистику
   */
  saveGame(): void {
    try {
      this.info.players.forEach(async (id) => {
        const player = this.players.getById(id);
        if (!player) {
          return;
        }
        arena.characters[id].exp += player.stats.collect.exp;
        arena.characters[id].expEarnedToday += player.stats.collect.exp;
        arena.characters[id].gold += player.stats.collect.gold;

        const kills = this.players.getKills(id).length;
        const death = player.alive ? 0 : 1;

        arena.characters[id].addGameStat({
          games: 1,
          death,
          kills,
        });
        await arena.characters[id].saveToDb();
      });
    } catch (e) {
      console.log('Game:', e);
    }
  }

  /**
   * Функция послематчевой статистики
   * @return возвращает строку статистики по всем игрокам
   */
  statistic() {
    this.giveGoldforKill();
    const winners = this.players.alivePlayers;
    const gold = this.players.deadPlayers.length ? 5 : 1;
    winners.forEach((p) => p.stats.addGold(gold));

    const playersByClan = this.players.groupByClan();

    const getStatisticString = (p: Player) => ({
      nick: p.nick,
      exp: p.stats.collect.exp,
      gold: p.stats.collect.gold,
    });

    const statisticByClan = mapValues(playersByClan, (players) => {
      return players?.map(getStatisticString);
    });

    return statisticByClan;
  }

  /**
   * Функция пробегает всех убитых и раздает золото убийцам
   */
  giveGoldforKill(): void {
    this.players.deadPlayers.forEach((p) => {
      const killer = this.players.getById(p.getKiller());
      if (killer && killer.id !== p.id) {
        killer.stats.addGold(5 * p.lvl);
      }
    });
  }

  /**
   * Функция выставляет "смерть" для игроков имеющих hp < 0;
   * Отсылает сообщение о смерти игрока в последнем раунде
   * @todo сообщение о смерти как-то нормально нужно сделать,
   * чтобы выводило от чего и от кого умер игрок
   */
  sortDead() {
    const dead = this.players.sortDead();
    this.cleanLongMagics();
    return dead;
  }

  /**
   * Очистка массива длительных магий от умерших
   */
  cleanLongMagics(): void {
    this.longActions = mapValues(this.longActions, (longMagicType) => {
      return longMagicType?.filter((act) => {
        return this.players.getById(act.target)?.alive;
      });
    });
  }

  /**
   * Интерфейс для работы со всеми игроками в игре
   * @param f функция применяющая ко всем игрокам в игре
   */
  forAllPlayers(f: (player: Player) => void): void {
    this.players.players.forEach((p) => f.call(this, p));
  }

  /**
   * Рассылка состояний живым игрокам
   */
  sendStatus(round: number): void {
    const playersByClan = this.players.groupByClan();

    const statusByClan = mapValues(playersByClan, (players = []) => {
      return players?.map((p) => p.getShortStatus());
    });

    for (const clan in playersByClan) {
      const players = playersByClan[clan] ?? [];
      if (clan === noClanName) {
        /** @todo find another way to send status */
        players.forEach((player) => {
          const status = [player.getStatus()];

          this.emit('startRound', { round, status, statusByClan }, player.id);
        });
      } else {
        const status = players.map((p) => p.getStatus());

        this.emit('startRound', { round, status, statusByClan }, clan);
      }
    }
  }
}
