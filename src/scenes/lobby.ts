import { BaseScene, Markup } from 'telegraf';
import arena from '../arena';
import { getIcon } from '../arena/MiscService';
import type { BaseGameScene } from './stage';

const lobby: BaseGameScene = new BaseScene('lobby');

lobby.enter(async ({ replyWithMarkdown, replyWithPhoto, session }) => {
  const {
    nickname, prof, lvl, exp, nextLvlExp,
  } = session.character;

  console.log(arena.magics.acidSpittle)
  try {
    await replyWithPhoto({ source: './assets/market.jpg' });
  } catch (e) {
    console.error(e);
  }

  await replyWithMarkdown(
    `*Лобби*
Так-так, значит ты *${nickname}* ${getIcon(prof)}${lvl} (📖${exp}/${nextLvlExp})`,
    Markup.keyboard([
      ['⚔ В бой'],
      ['🏰 Клан'],
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

lobby.hears('🏰 Клан', ({ scene }) => {
  scene.enter('clan');
});

export default lobby;
