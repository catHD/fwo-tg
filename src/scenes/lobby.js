const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const { charDescr } = require('../arena/MiscService');

const lobby = new Scene('lobby');

lobby.enter(({ replyWithMarkdown, session }) => {
  const { nickname, prof, lvl } = session.character;
  const { icon } = Object.values(charDescr).find((el) => el.prof === prof);

  replyWithMarkdown(
    `*Лобби*
Так-так, значит ты *${nickname}* (${icon}${lvl})`,
    Markup.keyboard([
      ['⚔ В бой'],
      ['😎 Профиль', '🏪 Магазин'],
      ['☸ Настройки', '❓ Помощь'],
    ]).resize().extra(),
  );
});

lobby.hears('😎 Профиль', ({ scene }) => {
  scene.enter('profile');
});

lobby.hears('⚔ В бой', ({ scene }) => {
  scene.enter('battleScene');
});

lobby.hears('🏪 Магазин', ({ scene }) => {
  scene.enter('shopScene');
});

lobby.hears('☸ Настройки', ({ scene }) => {
  scene.enter('settings');
});

module.exports = lobby;
