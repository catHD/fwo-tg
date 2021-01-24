import { Scenes, Markup } from 'telegraf';
import type { BotContext } from '../fwo';

export const profile = new Scenes.BaseScene<BotContext>('profile');

profile.enter(async (ctx) => {
  const { character } = ctx.session;
  const magicSkillButton = /m|p/.test(character.prof) ? '✨ Магии' : '⚡️ Умения';
  await ctx.replyWithMarkdown(
    `*Твой профиль, ${character.nickname}*`,
    Markup.keyboard([
      [`💪 Характеристики${character.free ? ' 🆙' : ''}`],
      ['🥋 Инвентарь', magicSkillButton],
      ['🔙 В лобби'],
    ]).resize(),
  );
  await ctx.replyWithMarkdown(
    `Статистика:\`\`\`\n
\t\tИгр:       🎮 ${character.games}
\t\tУбийств:   🔪 ${character.kills}
\t\tСмертей:   💀 ${character.death}
\t\tПобегов:   🏃 ${character.runs}
\t\tУровень:   🔺 ${character.lvl}
\t\tЗолото:    💰 ${character.gold}
\t\tОпыт:      📖 ${character.exp}
\t\tБонусы:    💡 ${character.bonus}\`\`\``,
  );
});

profile.hears('🥋 Инвентарь', (ctx) => {
  ctx.scene.enter('inventory');
});

profile.hears(/^💪 Характеристики/g, (ctx) => {
  ctx.scene.enter('harks');
});

profile.hears('🔙 В лобби', (ctx) => {
  ctx.scene.enter('lobby');
});

profile.hears('⚡️ Умения', (ctx) => {
  if (/m|p/.test(ctx.session.character.prof)) return;
  ctx.scene.enter('skills');
});

profile.hears('✨ Магии', (ctx) => {
  if (!/m|p/.test(ctx.session.character.prof)) return;
  ctx.scene.enter('magics');
});
