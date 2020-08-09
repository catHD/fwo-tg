const { BaseScene, Markup } = require('telegraf');
const loginHelper = require('../helpers/loginHelper');

/** @type {import('./stage').BaseGameScene} */
const settingsScene = new BaseScene('settings');

settingsScene.enter(async ({ replyWithMarkdown, reply, session }) => {
  await replyWithMarkdown(
    '*Настройки*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );

  await reply(
    'Доступные опции',
    Markup.inlineKeyboard([
      [Markup.callbackButton(
        'Удалить персонажа',
        'remove',
      )],
      [Markup.callbackButton(
        `Авторегистрация ${session.character.autoreg ? '✅' : '⬜️'}`,
        'autoreg',
      )],
    ]).resize().extra(),
  );
});

settingsScene.action('autoreg', ({ session, editMessageText }) => {
  session.character.autoreg = !session.character.autoreg;

  editMessageText(
    'Доступные опции',
    Markup.inlineKeyboard([
      [Markup.callbackButton(
        'Удалить персонажа',
        'remove',
      )],
      [Markup.callbackButton(
        `Авторегистрация ${session.character.autoreg ? '✅' : '⬜️'}`,
        'autoreg',
      )],
    ]).resize().extra(),
  );
});

settingsScene.action('remove', async ({
  session,
  scene,
  answerCbQuery,
  from,
}) => {
  const resp = await loginHelper.remove(from.id);
  session.character = null;
  if (resp) {
    answerCbQuery('Твой персонаж был удалён!');
    scene.enter('greeter');
  } else {
    answerCbQuery('Произошла ошибка');
    scene.enter('greeter');
  }
});

settingsScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

module.exports = settingsScene;
