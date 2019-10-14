const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const loginHelper = require('../helpers/loginHelper');

const { leave } = Stage;
const profile = new Scene('profile');

const HARK_NAMES = {
  str: 'Сила',
  dex: 'Ловкость',
  wis: 'Мудрость',
  int: 'Интелект',
  con: 'Телосложение',
};

const getInlineButton = (session, hark) => [
  {
    text: `${HARK_NAMES[hark]}: ${session[hark]}`,
    callback_data: 'do_nothing',
  },
  {
    text: `+${session[`${hark}Temp`] ? session[`${hark}Temp`] - session[hark] : ''}`,
    callback_data: `increase_${hark}`,
  },
];

profile.enter(({ reply, session }) => {
  reply(
    `Твой профиль, ${session.character.nickname}`,
    Markup.keyboard(['Характеристики']).oneTime().resize().extra(),
  );
});

profile.hears('Характеристики', ({ reply, session }) => {
  const { free } = session.character;

  reply(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      getInlineButton(session, 'str'),
      getInlineButton(session, 'dex'),
      getInlineButton(session, 'wis'),
      getInlineButton(session, 'int'),
      getInlineButton(session, 'con'),
      [{
        text: 'Сбросить',
        callback_data: 'reset',
      }],
      [{
        text: 'Подтвердить',
        callback_data: 'confirm',
      }],
    ]).resize().extra(),
  );
});

profile.action(/increase(?=_)/, ({ session, editMessageText, match }) => {
  if (session.character.free === 0) return;
  const [, hark] = match.input.split('_');
  const { free } = session.character;
  // eslint-disable-next-line no-param-reassign
  session.character[`${hark}Temp`] = session.character[`${hark}Temp`] || session.character[hark];
  // eslint-disable-next-line no-param-reassign
  session.character[hark] += 1;
  // eslint-disable-next-line no-param-reassign
  session.character.free -= 1;
  editMessageText(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      getInlineButton(session, 'str'),
      getInlineButton(session, 'dex'),
      getInlineButton(session, 'wis'),
      getInlineButton(session, 'int'),
      getInlineButton(session, 'con'),
      [{
        text: 'Сбросить',
        callback_data: 'reset',
      }],
      [{
        text: 'Подтвердить',
        callback_data: 'confirm',
      }],
    ]).resize().extra(),
  );
});

profile.action('confirm', async ({ session, scene }) => {
  await loginHelper.saveHarks(session.character);
  leave();
  scene.enter('profile');
});

profile.action('reset', async ({ session, editMessageText, update }) => {
  // eslint-disable-next-line no-param-reassign
  session.character = await loginHelper.getChar(update.message.from.id);
  const { free } = session.character;
  editMessageText(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      getInlineButton(session, 'str'),
      getInlineButton(session, 'dex'),
      getInlineButton(session, 'wis'),
      getInlineButton(session, 'int'),
      getInlineButton(session, 'con'),
      [{
        text: 'Сбросить',
        callback_data: 'reset',
      }],
      [{
        text: 'Подтвердить',
        callback_data: 'confirm',
      }],
    ]).resize().extra(),
  );
});

profile.command('exix', ({ scene }) => {
  leave();
  scene.enter('lobby');
});


module.exports = profile;
