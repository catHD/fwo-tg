import { groupBy, keyBy, partition } from 'lodash';
import Player from './PlayerService';

export default class PlayersService {
  readonly init: string[];
  private list: Record<string, Player>;
  /**
   * Конструктор объекта
   * @param init [charId,charId,...]
   */
  constructor(init: string[]) {
    this.init = init;

    const players = init.map(Player.load);
    this.list = keyBy(players, ({ id }) => id);
  }

  get players(): readonly Player[] {
    return Object.values(this.list);
  }

  get alivePlayers(): readonly Player[] {
    return this.players.filter(({ alive }) => alive);
  }

  get deadPlayers(): readonly Player[] {
    return this.players.filter(({ alive }) => !alive);
  }

  getById(id: string): Player | undefined {
    return this.list[id];
  }

  /**
   * Функция вернет массив игроков в моей тиме
   * @param clan объект клана
   */
  getMyTeam(id: string): readonly Player[] {
    const player = this.getById(id);
    if (!player?.clan) {
      return [];
    }
    return this.players.filter((p) => p.clan?.id === player.clan?.id);
  }

  getPlayersByClan(clanId: string | undefined): readonly Player[] {
    if (!clanId) {
      return this.players.filter((player) => !player.clan);
    }
    return this.players.filter((player) => player.clan?.id === clanId);
  }

  /**
   * Функция возвращает рандомного игрока из массива живых
   * @return
   */
  get randomAlive(): Readonly<Player> {
    const alive = this.alivePlayers;
    return alive[Math.floor(Math.random() * alive.length)];
  }

  get partitionByClan() {
    const [withClan, withoutClan] = partition(this.list, ({ clan }) => clan);
    const groupByClan = groupBy(withClan, ({ clan }) => clan?.name);
    return { withClan, withoutClan, groupByClan };
  }

  get partitionAliveByClan() {
    const [withClan, withoutClan] = partition(this.alivePlayers, ({ clan }) => clan);
    const groupByClan = groupBy(withClan, ({ clan }) => clan?.name);
    return { withClan, withoutClan, groupByClan };
  }

  groupByClan() {
    return Object.groupBy(this.players, ({ clan }) => clan?.name || 'noClan');
  }

  /**
   * Сбрасываем всем игрокам кол-во доступных процентов на 100
   */
  reset() {
    this.players.forEach((player) => player.reset());
  }

  sortDead(): readonly Player[] {
    const dead: Player[] = [];
    this.players.forEach((player) => {
      if (player.stats.val('hp') <= 0 && player.alive) {
        dead.push(player);
        player.setDead();
      }
    });

    return dead;
  }

  getKills(id: string): readonly Player[] {
    return this.players.filter((player) => player.getKiller() === id);
  }

  kick(id: string) {
    delete this.list[id];
  }
}
