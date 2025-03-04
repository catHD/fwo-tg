import { Scenes, Markup } from 'telegraf';
import type { BotContext } from '../../fwo';
import * as keyboards from './keyboards';
import * as messages from './messages';

export const shopScene = new Scenes.BaseScene<BotContext>('shopScene');

shopScene.enter(async (ctx) => {
  await ctx.replyWithMarkdown(
    '*Магазин*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize(),
  );
  await ctx.reply(
    messages.enter(),
    keyboards.enter(),
  );
});

shopScene.action(/itemType(?=_)/, async (ctx) => {
  const [, type] = ctx.match.input.split('_');

  await ctx.editMessageText(
    messages.itemType(type),
    keyboards.itemType(type, ctx.session.character),
  );
});

shopScene.action(/itemInfo(?=_)/, async (ctx) => {
  const [, code] = ctx.match.input.split('_');
  await ctx.editMessageText(
    messages.itemInfo(code, ctx.session.character),
    keyboards.itemInfo(code),
  );
});

shopScene.action(/buy(?=_)/, async (ctx) => {
  const [, code] = ctx.match.input.split('_');
  const result = await ctx.session.character.buyItem(code);

  if (!result) {
    await ctx.answerCbQuery(messages.noGold());
  } else {
    await ctx.editMessageText(
      messages.buy(code, ctx.session.character),
      keyboards.buy(code),
    );
  }
});

shopScene.action('back', async (ctx) => {
  await ctx.editMessageText(
    messages.enter(),
    keyboards.enter(),
  );
});

shopScene.action('inventory', async (ctx) => {
  await ctx.scene.enter('inventory');
});

shopScene.hears('🔙 В лобби', async (ctx) => {
  await ctx.scene.enter('lobby');
});
