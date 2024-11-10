import { Scenes, Markup } from 'telegraf';
import type { CharacterService } from '../arena/CharacterService';
import { Harks } from '../data';
import type { BotContext } from '../fwo';
import { mono } from '../utils/formatString';

export const harkScene = new Scenes.BaseScene<BotContext>('harks');

const getInlineKeyboard = (character: CharacterService) => {
  const inlineKeyboardArr = Harks.harksList
    .map((hark) => [
      Markup.button.callback(
        `${Harks.harksData[hark].name}: ${character.attributes[hark]}`,
        `info_${hark}`,
      ),
      Markup.button.callback(
        `+ ${character.getIncreaseHarkCount(hark)}`,
        `increase_${hark}`,
      ),
    ]);
  inlineKeyboardArr.push([Markup.button.callback('Подтвердить', 'confirm')]);
  inlineKeyboardArr.push([Markup.button.callback('Сбросить', 'reset')]);
  inlineKeyboardArr.push([Markup.button.callback('Доп. характеристики', 'def_harks')]);
  inlineKeyboardArr.push([Markup.button.callback('В профиль', 'exit')]);

  return inlineKeyboardArr;
};

harkScene.enter(async (ctx) => {
  const { free } = ctx.session.character;
  await ctx.replyWithMarkdown(
    '*Характеристики*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize(),
  );
  await ctx.reply(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(ctx.session.character),
    ]),
  );
});

harkScene.action(/info(?=_)/, async (ctx) => {
  const [, hark] = ctx.match.input.split('_') as [string, Harks.Hark];
  await ctx.editMessageText(
    Harks.harksData[hark].descr,
    {
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Назад', 'back')],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

harkScene.action(/confirm|reset|back|increase(?=_)/, async (ctx) => {
  if (ctx.match.input.includes('increase_')) {
    try {
      const [, hark] = ctx.match.input.split('_');
      ctx.session.character.increaseHark(hark);
    } catch (e) {
      await ctx.answerCbQuery(e.message);
      return;
    }
  }
  if (ctx.match.input === 'confirm') {
    await ctx.session.character.submitIncreaseHarks();
    await ctx.answerCbQuery('Изменения успешно применены');
  }
  if (ctx.match.input === 'reset') {
    ctx.session.character.resetHarks();
    await ctx.answerCbQuery('Изменения успешно сброшены');
  }

  await ctx.editMessageText(
    `Свободных очков ${ctx.session.character.free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(ctx.session.character),
    ]),
  );
});

harkScene.action('def_harks', async (ctx) => {
  const { dynamicAttributes, prof } = ctx.session.character;
  const message = mono([`
Урон:                     ${dynamicAttributes.hit.min} - ${dynamicAttributes.hit.max}
Атака:                    ${dynamicAttributes.phys.attack}
Защита:                   ${dynamicAttributes.phys.defence}
Здоровье:                 ${dynamicAttributes.base.hp}
Лечение:                  ${dynamicAttributes.heal.min} - ${dynamicAttributes.heal.max}
Мана:                     ${dynamicAttributes.base.mp}
Восстановление маны:      ${dynamicAttributes.regen.mp}
Энергия:                  ${dynamicAttributes.base.en}
Восстановление энергии:   ${dynamicAttributes.regen.en}
Магическая атака:         ${dynamicAttributes.magic.attack}
Магическая защита:        ${dynamicAttributes.magic.defence}`,
  prof === 'l' && `${`Кол-во целей для атаки:  ${dynamicAttributes.maxTarget}`}`,
  (prof === 'm' || prof === 'p') && `${`Длительность магии:       ${dynamicAttributes.spellLength}`}`,
  ].filter((val) => val).join('\n'));

  await ctx.editMessageText(
    message,
    {
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Назад', 'back')],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

harkScene.action('exit', async (ctx) => {
  ctx.session.character.resetHarks();
  await ctx.scene.enter('profile');
});

harkScene.hears('🔙 В лобби', async (ctx) => {
  ctx.session.character.resetHarks();
  await ctx.scene.enter('lobby');
});
