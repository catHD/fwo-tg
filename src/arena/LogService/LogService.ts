import type { SuccessArgs, FailArgs } from '@/arena/Constuructors/types';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import type { HistoryItem } from '@/arena/HistoryService';
import { sendBattleLogMessages } from '@/helpers/channelHelper';
import { joinLongDmgMessages, joinLongMessages, formatMessage, joinHealMessages } from './utils';

export type Message = SuccessArgs | FailArgs;

type Formatter = (message: Message) => string;
type Writer = (data: string[]) => void | Promise<void>;

/**
 * Класс вывода данных в battlelog
 * @todo WIP класс в стадии формирования
 * @see https://trello.com/c/qxnIM1Yq/17
 */
export class LogService {
  private messages: Message[] = [];

  constructor(
    private writer: Writer = sendBattleLogMessages,
    private formatter: Formatter = formatMessage,
  ) {}

  async sendBattleLog(history: HistoryItem[]) {
    history.forEach((item) => {
      if (isSuccessResult(item)) {
        this.success(item);
      } else {
        this.fail(item);
      }
    });

    try {
      await this.writer(this.format());
    } catch (e) {
      console.log('sendBattleLog: ', e);
    } finally {
      this.reset();
    }
  }

  getBattleLog(history: HistoryItem[]) {
    try {
      history.forEach((item) => {
        if (isSuccessResult(item)) {
          this.success(item);
        } else {
          this.fail(item);
        }
      });

      return this.messages;
    } finally {
      this.reset();
    }
  }

  /**
   * Удачный проход action
   * @param message сообщение
   */
  private success(message: SuccessArgs) {
    switch (message.actionType) {
      case 'heal':
        this.messages = joinHealMessages(this.messages, message);
        break;
      case 'magic-long':
        this.messages = joinLongMessages(this.messages, message);
        break;
      case 'dmg-magic-long':
        this.messages = joinLongDmgMessages(this.messages, message);
        break;
      default:
        this.messages.push(message);
        break;
    }
  }

  /**
   * Неудачный проход action
   * @param message сообщение
   */
  private fail(message: FailArgs): void {
    this.messages.push(message);
  }

  private format() {
    return this.messages.map((message) => this.formatter(message));
  }

  private reset() {
    this.messages = [];
  }
}
