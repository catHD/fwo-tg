import { ActionService } from '@/arena/ActionService';
import { type RoundService, RoundStatus } from '@/arena/RoundService';
import OrderError from '@/arena/errors/OrderError';
import type PlayersService from '@/arena/PlayersService';
import type { Player } from '@/arena/PlayersService';

export interface Order {
  initiator: string;
  target: string;
  action: string;
  proc: number;
}

/**
 * OrderService
 *
 * @description Сервис обработки входящих заказов игроков
 * @module Service/Order
 * @todo Нужно доработать структуру и Error
 * @todo для скиллов нужна жесткая проверка заказанных процентов
 */
export default class Orders {
  /** Текущий список заказов */
  ordersList: Order[] = [];
  /** История заказов */
  hist: Order[][] = [];

  playersService: PlayersService;
  roundService: RoundService;

  constructor(playersService: PlayersService, roundService: RoundService) {
    this.playersService = playersService;
    this.roundService = roundService;
  }

  get lastOrders() {
    return this.hist.at(-1);
  }

  /**
   * @desc Функция приёма заказов
   * @param order объект заказа
   * @example
   * {
   *  initiator: '123abc',
   *  target: 'abc123',
   *  proc: 10,
   *  action: 'handsHeal',
   * }
   * @throws {OrderError}
   */
  orderAction(order: Order): void {
    console.log('orderAction >', order.initiator);

    const initiator = this.playersService.getById(order.initiator);
    const target = this.playersService.getById(order.target);

    this.validateOrder(initiator, target, order);

    // if (action === 'attack') {
    //   a.hand = 'righthand';
    // }

    initiator.setProc(initiator.proc - order.proc);
    console.log('order :::: ', order);
    this.ordersList.push(order);
  }

  /**
   * Валидация заказа
   * @throws {OrderError}
   */
  private validateOrder(
    initiator: Player | undefined,
    target: Player | undefined,
    order: Order,
  ): asserts initiator {
    // @todo Нужны константы для i18n
    if (!initiator) {
      throw new OrderError('Вы не в игре', order);
    }
    if (this.roundService.status !== RoundStatus.START_ORDERS) {
      throw new OrderError('Раунд ещё не начался', order);
      // @todo тут надо выбирать из живых целей
    }
    if (!target || !target.alive) {
      throw new OrderError('Нет цели или цель мертва', order);
    }
    if (Number(order.proc) > Number(initiator.proc)) {
      throw new OrderError('Нет процентов', order);
      // тут нужен геттер из Player
    }
    if (this.isMaxTargets(order, initiator)) {
      throw new OrderError('Слишком много целей', order);
    }
    if (!this.isValidAction(order, initiator)) {
      throw new OrderError(`action spoof:${order.action}`);
    }
  }

  /**
   * Функция отмены всех действия цели
   * @param charId идентификатор игрока
   */
  block(charId: string): void {
    this.ordersList = this.ordersList.filter((order) => order.initiator !== charId);
    console.log('block order', this.ordersList);
  }

  /**
   * Очищаем массив заказов
   */
  reset(): void {
    this.hist.push(this.ordersList);
    this.ordersList = [];
  }

  /**
   * Проверка достижения максимального кол-ва целей при атаке
   */
  isMaxTargets({ initiator, action }: Order, player: Player): boolean {
    return this.getNumberOfOrder(initiator, action) >= player.stats.val('maxTarget');
  }

  /**
   * Проверка доступно ли действие для персонажа
   */
  isValidAction({ action }: Order, player: Player): boolean {
    if (ActionService.isBaseAction(action)) {
      return true;
    }

    return (player.getSkillLevel(action) || player.getMagicLevel(action)) > 0;
  }

  /**
   * Возвращает все заказы игрока в текущем раунда
   * @param charId идентификатор персонажа
   */
  getPlayerOrders(charId: string): Order[] {
    return this.ordersList.filter((o) => o.initiator === charId);
  }

  /**
   * Проверяет делал ли игрок заказ. Опционально проверяет название магии или умения в заказе
   * @param charId идентификатор персонажа
   * @param act название умения или магии
   */
  checkPlayerOrder(charId: string, act?: string): boolean {
    return this.ordersList.some((o) => o.initiator === charId && (act ? o.action === act : true));
  }

  /**
   * Проверяет делал ли игрок заказ в предыдущем раунде
   * @param charId идентификатор персонажа
   */
  checkPlayerOrderLastRound(charId: string) {
    return this.lastOrders?.some((o) => o.initiator === charId);
  }

  /**
   * Возвращает количество заказов игрока для данного умения
   * @param charId идентификатор персонажа
   * @param action название умения или магии
   * @returns количество заказов игрока для данного умения
   */
  getNumberOfOrder(charId: string, action: string): number {
    return this.ordersList.filter((o) => o.initiator === charId && o.action === action).length;
  }

  /**
   * Повторяет заказ для игрока
   * @param charId идентификатор персонажа
   */
  repeatLastOrder(charId: string): void {
    this.lastOrders?.forEach((order) => {
      if (order.initiator === charId) {
        try {
          this.orderAction(order);
        } catch (e) {
          console.log('Error in orders:', e);
        }
      }
    });
  }

  /**
   * Сбрасывает заказ для игрока
   * @param charId идентификатор персонажа
   */
  resetOrdersForPlayer(charId: string): void {
    this.ordersList = this.ordersList.filter((o) => o.initiator !== charId);
    this.playersService.getById(charId)?.setProc(100);
  }
}
