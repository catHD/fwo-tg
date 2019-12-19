/**
 * Сцена боя
 * Описание:
 */
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const channelHelper = require('../helpers/channelHelper');
const arena = require('../arena');
const GameService = require('../arena/GameService');
const { charDescr } = require('../arena/MiscService');

const battleScene = new Scene('battleScene');

const penaltyTime = 180000;

/**
 * Проверяет можно ли игроку начать поиск
 * Если сделано слишком много попыток за заданное время, возвращает false
 * @param {Object} character - объект персонажа
 * @return {boolean}
 */
const checkCancelFindCount = (character) => {
  const time = Date.now();
  if (!character.mm) {
    character.mm = {
      time,
      try: 0,
    };
  }
  if (character.mm.try >= 3 && time - character.mm.time < penaltyTime) {
    return false;
  }
  character.mm.try += 1;
  character.mm.time = time;
  return true;
};

battleScene.enter(async ({ reply, replyWithMarkdown }) => {
  // @todo При поиске боя хотелось бы ещё выдавать сюда картиночку
  await replyWithMarkdown('*Поиск Боя*', Markup.removeKeyboard().extra());
  const message = await reply(
    'Кнопки',
    Markup.inlineKeyboard([
      [Markup.callbackButton('Искать приключений на ...', 'search')],
      [Markup.callbackButton('Назад', 'exit')],
    ]).resize().extra(),
  );
  channelHelper.messages[message.chat.id] = message.message_id;
});

battleScene.action('search', async ({ editMessageText, session }) => {
  const {
    id, mm, nickname, lvl, prof,
  } = session.character;
  if (!checkCancelFindCount(session.character)) {
    const remainingTime = ((penaltyTime - (Date.now() - mm.time)) / 1000).toFixed();
    await editMessageText(
      `Слишком много жмёшь кнопку, жди ${remainingTime} секунд до следующей попытки`,
      Markup.inlineKeyboard([
        [Markup.callbackButton('Искать приключений на ...', 'search')],
        [Markup.callbackButton('Назад', 'exit')],
      ]).resize().extra(),
    );
  } else {
    const searchObject = { charId: id, psr: 1000, startTime: Date.now() };
    const { icon } = Object.values(charDescr).find((el) => el.prof === prof);
    arena.mm.push(searchObject);
    await editMessageText(
      'Кнопки',
      Markup.inlineKeyboard([
        Markup.callbackButton('Нет-нет, остановите, я передумал!', 'stop'),
      ]).resize().extra(),
    );
    await channelHelper.broadcast(
      `Игрок *${nickname}* (${icon}${lvl}) начал поиск игры`,
    );
  }
});

battleScene.action('stop', async ({ editMessageText, session }) => {
  const { id } = session.character;
  arena.mm.pull(id);
  editMessageText(
    'Кнопки',
    Markup.inlineKeyboard([
      [Markup.callbackButton('Искать приключений на ...', 'search')],
      [Markup.callbackButton('Назад', 'exit')],
    ]).resize().extra(),
  );
  await channelHelper.broadcast(
    `Игрок ${global.arena.players[id].nickname} внезапно передумал`,
  );
});

battleScene.action(/action(?=_)/, async ({ editMessageText, session, match }) => {
  const gameId = global.arena.players[session.character.id].mm;
  const [, action] = match.input.split('_');
  const aliveArr = GameService.aliveArr(gameId)
    .map(({ nick, id }) => Markup.callbackButton(nick,
      `${action}_${id}_${nick}`));
  editMessageText(
    `Выбери цель для ${match}`,
    Markup.inlineKeyboard([
      ...aliveArr,
    ]).resize().extra(),
  );
});

battleScene.action(/\w*_\w*_\w*/, async ({ editMessageText, session, match }) => {
  const [action, target, nick] = match.input.split('_');
  const initiator = session.character.id;
  const gameId = global.arena.players[initiator].mm;
  /** @type {GameService} */
  const Game = global.arena.games[gameId];
  Game.orders.orderAction({
    initiator, target, action, proc: 100,
  });
  editMessageText(
    `Заказан ${action} на игрока ${nick}`,
  );
});

battleScene.action('exit', ({ scene }) => {
  scene.enter('lobby');
});

battleScene.command('run', async ({ reply, session }) => {
  const { id } = session.character;
  const gameId = global.arena.players[id].mm;
  /** @type {GameService} */
  const Game = global.arena.games[gameId];

  Game.preKick(id, 'run');

  reply('Ты будешь выброшен из игры в конце этого раунда');
});

module.exports = battleScene;
