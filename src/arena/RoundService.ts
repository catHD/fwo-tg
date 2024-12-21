import RoundEmitter from 'node:events';
import config from '@/arena/config';

export enum RoundStatus {
  INIT = 'INIT',
  START_ROUND = 'START_ROUND',
  START_ORDERS = 'START_ORDERS',
  END_ORDERS = 'END_ORDERS',
  ENGINE = 'ENGINE',
  END_ROUND = 'END_ROUND',
  TIMEOUT = 'TIMEOUT',
}

interface Round {
  state: RoundStatus;
  round: number;
}

const ROUND_SERVICE_EVENT = 'Round';

/**
 * RoundService
 *
 * Конструктор раунда
 * @description Обработка раунда
 * @module Service/Round
 */
export class RoundService {
  private emitter = new RoundEmitter();
  count = 0;
  status = RoundStatus.INIT;

  /**
   * @description Возвращает объект с текущим состоянием раунда
   * @return объект последнего состояния рануда
   */
  get lastRound(): Round {
    return {
      state: this.status,
      round: this.count,
    };
  }

  private write(): void {
    this.emitter.emit(ROUND_SERVICE_EVENT, this.lastRound);
  }

  subscribe(listener: (data: Round) => void): void {
    this.emitter.on(ROUND_SERVICE_EVENT, listener);
  }

  unsubscribe() {
    this.emitter.removeAllListeners();
  }

  /**
   * Иницилизируем начало раунда
   */
  private startRound(): void {
    this.status = RoundStatus.START_ROUND;
    this.count += 1;
    this.write();
    console.debug('RC debug:: start round:', this.count);
  }

  /**
   * Фаза заказов
   * Рассылаем всем состояние HP отправляем сервисное о старте раунда
   */
  private startOrders(): void {
    this.status = RoundStatus.START_ORDERS;
    this.write();
  }

  /**
   * Инициация окончания игры
   * Запускаем завершение раунда, и переход к следующему
   * сюда нужны таймауты проверки на end и т.п
   */
  private endRound(): void {
    this.status = RoundStatus.END_ROUND;
    this.write();
  }

  /**
   * Рассылаем состояние об окончание order phase, приступаем к выполнению
   * engine function
   */
  private engine(): void {
    this.status = RoundStatus.END_ORDERS;
    this.write();
    this.status = RoundStatus.ENGINE;
    this.write();
  }

  /**
   * @description Функция изменения состояний объекта
   * @param state строка нового состояния
   */
  private onNextState(state: RoundStatus = RoundStatus.INIT): void {
    console.log('Round State:', state);
    switch (state) {
      case RoundStatus.INIT:
        // Состояние инициации раунда после создания игры
        this.nextState(RoundStatus.START_ROUND);
        break;
      case RoundStatus.START_ROUND:
        this.startRound();
        this.nextState(RoundStatus.START_ORDERS);
        break;
      case RoundStatus.START_ORDERS:
        this.startOrders();
        this.nextState(RoundStatus.END_ORDERS, config.ordersTime);
        break;
      case RoundStatus.END_ORDERS:
        this.engine();
        this.nextState(RoundStatus.END_ROUND);
        break;
      case RoundStatus.TIMEOUT:
        // code
        break;
      case RoundStatus.END_ROUND:
        this.endRound();
        break;

      default:
        console.error('Unknown Round State', state);
    }
  }

  /**
   * goNext
   *
   * @description Функция изменения с одного состояния в другое
   * @param newState строка нового состояния перевод состояния
   * @param timeout число в мс, через которое следует выполнить
   */
  private nextState(newState: RoundStatus, timeout = config.roundTimeout): void {
    const timer = setTimeout(() => {
      this.onNextState(newState);
      clearTimeout(timer);
    }, timeout);
  }

  initRound(): void {
    this.nextState(RoundStatus.INIT, 0);
  }

  nextRound(): void {
    this.nextState(RoundStatus.START_ROUND, 500);
  }
}
