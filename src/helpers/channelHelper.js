const Markup = require('telegraf/markup');
const BattleKeyboard = require('./BattleKeyboard');
const arena = require('../arena');
const { getIcon } = require('../arena/MiscService');
/**
 * Помощник для отправки сообщений в общий чат
 * @typedef {import ('../arena/PlayerService')} Player
 * @typedef {import ('../arena/GameService')} Game
 */

const chatId = process.env.BOT_CHATID || -1001483444452;

module.exports = {
  bot: null,
  messages: {},
  statusMessages: {},
  /**
   * @param {string} data - текст отправляемого сообщения
   * @param {Number|String} [id=chatId] - id чата
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
    return new BattleKeyboard(player)
      .setActions()
      .setMagics()
      .setSkills()
      .render();
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
    delete this.statusMessages[player.tgId];
    const { exp, gold } = player.stats.collect;
    const character = arena.characters[player.id];
    const button = [];
    const {
      autoreg, nickname, lvl, prof,
    } = arena.characters[player.id];

    if (autoreg) {
      await this.broadcast(`Игрок *${nickname}* (${getIcon(prof)}${lvl}) начал поиск игры`);
      button.push(Markup.callbackButton('Остановить поиск', 'stop'));
    } else {
      button.push(Markup.callbackButton('Выход в лобби', 'exit'));
    }
    await this.bot.telegram.sendMessage(
      player.tgId,
      `Награда за бой:
📖 ${exp} (${character.exp}/${character.nextLvlExp})
💰 ${gold} (${character.gold})
${autoreg ? 'Идёт поиск новой игры...' : ''}`,
      Markup.inlineKeyboard(button).resize().extra(),
    );
  },

  /**
   * Отправляет сообщение для сбежавшего и кнопку выхода в лобби
   * @param {Player} player
   */
  async sendRunButton(player) {
    delete this.statusMessages[player.tgId];
    await this.bot.telegram.sendMessage(
      player.tgId,
      'Ты бежал из боя',
      Markup.inlineKeyboard([Markup.callbackButton('Выход в лобби', 'exit')]).resize().extra(),
    );
  },
};
