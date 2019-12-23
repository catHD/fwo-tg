const Markup = require('telegraf/markup');
/**
 * Помощник для отправки сообщений в общий чат
 * @typedef {import ('../arena/PlayerService')} Player
 */

const chatId = process.env.BOT_CHATID || -1001483444452;

module.exports = {
  bot: null,
  messages: {},
  statusMessages: {},
  /**
   * @param {string} data - текст отправляемого сообщения
   * @param {Number} [id=chatId] - id чата
   */
  async broadcast(data, id = chatId) {
    await this.bot.telegram.sendMessage(id, data, { parse_mode: 'Markdown' });
  },

  /**
   * Отправляет статус игры игрокам
   * @param {string} data - текст отправляемого сообщения
   * @param {number} id - id чата
   */
  async sendStatus(data, id) {
    if (!this.statusMessages[id]) {
      const message = await this.bot.telegram.sendMessage(id, data, { parse_mode: 'Markdown' });
      this.statusMessages[id] = message.message_id;
    } else {
      this.updateStatus(data, id);
    }
  },
  /**
   * Обновляет статус игры у игроков
   * @param {string} data - текст отправляемого сообщения
   * @param {number} id - id чата
   */
  async updateStatus(data, id) {
    await this.bot.telegram.editMessageText(
      id,
      this.statusMessages[id],
      '',
      data,
      { parse_mode: 'Markdown' },
    );
  },
  /**
   * Получение кнопок заказа. Базовые кнопки + доступные магии
   * @param {Player} player - объект игрока
   */
  getOrderButtons(player) {
    const buttons = [
      [Markup.callbackButton('Атака', 'action_attack')],
      [Markup.callbackButton('Лечение', 'action_handsHeal')],
      [Markup.callbackButton('Защита', 'action_protect')],
      [Markup.callbackButton('Реген', 'action_regen')],
    ];
    const keys = Object.keys(player.magics);
    if (keys.length) {
      keys.forEach((key) => {
        buttons.push([Markup.callbackButton(key, `action_${key}`)]);
      });
    }
    return buttons;
  },
  /**
   * Отправка кнопок при начале заказа
   * @param {Player} player - объект игрока
   */
  async sendOrderButtons(player) {
    const message = await this.bot.telegram.sendMessage(
      player.tgId,
      'Выбери действие',
      Markup.inlineKeyboard(this.getOrderButtons(player)).resize().extra(),
    );
    this.messages[message.chat.id] = message.message_id;
  },

  /**
   * Удаление кнопок после заказа
   * @param {Player} player - объект игрока
   */
  async removeMessages(player) {
    await this.bot.telegram.deleteMessage(
      player.tgId,
      this.messages[player.tgId],
    );
  },

  /**
   * Отправляет статистику и кнопку выхода в лобби
   * @param {Player} player
   */
  async sendExitButton(player) {
    const { exp, gold } = player.stats.collect;
    await this.bot.telegram.sendMessage(
      player.tgId,
      `Награда за бой:
📖 ${exp}
💰 ${gold}`,
      Markup.inlineKeyboard([Markup.callbackButton('Выход в лобби', 'exit')]).resize().extra(),
    );
  },

  /**
   * Отправляет сообщение для сбежавшего и кнопку выхода в лобби
   * @param {Player} player
   */
  async sendRunButton(player) {
    await this.bot.telegram.sendMessage(
      player.tgId,
      'Ты бежал из боя',
      Markup.inlineKeyboard([Markup.callbackButton('Выход в лобби', 'exit')]).resize().extra(),
    );
  },
};
