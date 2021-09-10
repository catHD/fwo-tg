import { Markup } from 'telegraf';
import arena from '../arena';
import type Player from '../arena/PlayerService';
import { Profs } from '../data';
import BattleKeyboard from './BattleKeyboard';

const chatId = process.env.BOT_CHATID || -1001483444452;

const messages: Record<number, number> = {};
const statusMessages: Record<number, number> = {};

export function setMessage(key: number, data: number): void {
  messages[key] = data;
}
/**
 * @param data - текст отправляемого сообщения
 * @param id - id чата
 */
export async function broadcast(data: string, id: number | string = chatId): Promise<void> {
  try {
  await arena.bot.telegram.sendMessage(id, data, { parse_mode: 'Markdown' });
  } catch (e) {
    console.log(`error: broadcast: ${e.message} for ${id}`);
  }
}

/**
 * Обновляет статус игры у игроков
 * @param data - текст отправляемого сообщения
 * @param id - id чата
 */
export async function updateStatus(data: string, id: number): Promise<void> {
  await arena.bot.telegram.editMessageText(
    id,
    statusMessages[id],
    '',
    data,
    { parse_mode: 'Markdown' },
  );
}

/**
 * Отправляет статус игры игрокам
 * @param data - текст отправляемого сообщения
 * @param id - id чата
 */
export async function sendStatus(data: string, id: number): Promise<void> {
  try {
    if (!statusMessages[id]) {
      const message = await arena.bot.telegram.sendMessage(id, data, { parse_mode: 'Markdown' });
      statusMessages[id] = message.message_id;
    } else {
      updateStatus(data, id);
    }
  } catch (e) {
    console.log(`error: sendOrderButtons: ${e.message} for ${id}`);
  }
}

/**
 * Получение кнопок заказа. Базовые кнопки + доступные магии
 * @param player - объект игрока
 */
export function getOrderButtons(player: Player): ReturnType<BattleKeyboard['render']> {
  return new BattleKeyboard(player)
    .setActions()
    .setMagics()
    .setSkills()
    .render();
}

/**
 * Отправка кнопок при начале заказа
 * @param player - объект игрока
 */
export async function sendOrderButtons(player: Player): Promise<void> {
  try {
    const message = await arena.bot.telegram.sendMessage(
      player.tgId,
      'Выбери действие',
      Markup.inlineKeyboard(getOrderButtons(player)),
    );
    messages[message.chat.id] = message.message_id;
  } catch (e) {
    console.log(`error: sendOrderButtons: ${e.message} for ${player.id}`);
  }
}

/**
 * Удаление кнопок после заказа
 * @param player - объект игрока
 */
export async function removeMessages(player: Player): Promise<void> {
  try {
    await arena.bot.telegram.deleteMessage(
      player.tgId,
      messages[player.tgId],
    );
  } catch (e) {
    console.log(`error: removeMessages: ${e.message} for ${player.id}`);
  }
}

/**
 * Удаление сообщения со статусом игры
 * @param player - объект игрока
 */
export async function removeStatusMessages(player: Player): Promise<void> {
  try {
    await arena.bot.telegram.deleteMessage(
      player.tgId,
      statusMessages[player.tgId],
    );
    delete statusMessages[player.tgId];
  } catch (e) {
    console.log(`error: removeStatusMessages: ${e.message} for ${player.id}`);
  }
}

/**
 * Отправляет статистику и кнопку выхода в лобби
 * @param player
 */
export async function sendExitButton(player: Player): Promise<void> {
  try {
    await removeStatusMessages(player);

    const { exp, gold } = player.stats.collect;
    const character = arena.characters[player.id];
    const {
      autoreg, nickname, lvl, prof, clan, expLimitToday, expEarnedToday,
    } = character;

    let expMessage = `${exp}`;
    if (expEarnedToday >= expLimitToday) {
      expMessage += ' (достигнут лимит опыта на сегодня)';
    } else {
      expMessage += ` (доступно ещё 📖 ${expLimitToday - expEarnedToday} сегодня)`;
    }

    const message = await arena.bot.telegram.sendMessage(
      player.tgId,
      `Награда за бой:
  📖 ${expMessage} (${character.exp}/${character.nextLvlExp})
  💰 ${gold} (${character.gold})
  ${autoreg ? 'Идёт поиск новой игры...' : ''}`,
      Markup.inlineKeyboard([
        Markup.button.callback('Остановить поиск', 'stop', !autoreg),
        Markup.button.callback('Выход в лобби', 'exit', autoreg),
      ]),
    );

    if (autoreg) {
      messages[message.chat.id] = message.message_id;
      broadcast(
        `Игрок ${clan ? `\\[${clan.name}]` : ''} *${nickname}* (${Profs.profsData[prof].icon}${lvl}) начал поиск игры`,
      );
    }
  } catch (e) {
    console.log(`error: sendExitButton: ${e.message} for ${player.id}`);
  }
}

/**
 * Отправляет сообщение для сбежавшего и кнопку выхода в лобби
 * @param player
 */
export async function sendRunButton(player: Player): Promise<void> {
  try {
  await removeStatusMessages(player);

  await arena.bot.telegram.sendMessage(
    player.tgId,
    'Ты бежал из боя',
    Markup.inlineKeyboard([Markup.button.callback('Выход в лобби', 'exit')]),
  );
  } catch (e) {
    console.log(`error: sendRunButton: ${e.message} for ${player.id}`);
  }
}
