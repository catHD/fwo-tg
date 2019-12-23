const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const { harksDescr } = require('../arena/MiscService');

const { leave } = Stage;
const harkScene = new Scene('harks');

/**
 * @param {import ('../arena/CharacterService')} character
 */
const getInlineKeyboard = (character) => {
  const inlineKeyboardArr = Object
    .keys(harksDescr)
    .map((hark) => [
      Markup.callbackButton(
        `${harksDescr[hark].name}: ${character.harks[hark]}`,
        `info_${hark}`,
      ),
      Markup.callbackButton(
        `+ ${character.getIncreaseHarkCount(hark)}`,
        `increase_${hark}`,
      ),
    ]);
  inlineKeyboardArr.push([Markup.callbackButton('Подтвердить', 'confirm')]);
  inlineKeyboardArr.push([Markup.callbackButton('Сбросить', 'reset')]);
  inlineKeyboardArr.push([Markup.callbackButton('В профиль', 'exit')]);

  return inlineKeyboardArr;
};

harkScene.enter(async ({ replyWithMarkdown, reply, session }) => {
  const { free } = session.character;
  await replyWithMarkdown(
    '*Характеристики*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );
  reply(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(session.character),
    ]).resize().extra(),
  );
});

harkScene.action(/increase(?=_)/, ({
  session,
  editMessageText,
  match,
  answerCallbackQuery,
}) => {
  const [, hark] = match.input.split('_');

  try {
    session.character.increaseHark(hark);

    editMessageText(
      `Свободных очков ${session.character.free}`,
      Markup.inlineKeyboard([
        ...getInlineKeyboard(session.character),
      ]).resize().extra(),
    );
  } catch (e) {
    answerCallbackQuery(e.message);
  }
});

harkScene.action(/info(?=_)/, ({ answerCallbackQuery, match }) => {
  const [, hark] = match.input.split('_');
  answerCallbackQuery(harksDescr[hark].descr);
});

harkScene.action('confirm', async ({ session, editMessageText }) => {
  await session.character.submitIncreaseHarks();

  editMessageText(
    `Свободных очков ${session.character.free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(session.character),
    ]).resize().extra(),
  );
});

harkScene.action('reset', async ({ session, editMessageText }) => {
  session.character.resetHarks();

  editMessageText(
    `Свободных очков ${session.character.free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(session.character),
    ]).resize().extra(),
  );
});

harkScene.action('exit', ({ scene }) => {
  leave();
  scene.enter('profile');
});

harkScene.hears('🔙 В лобби', ({ scene }) => {
  leave();
  scene.enter('lobby');
});

module.exports = harkScene;
