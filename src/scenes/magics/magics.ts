// @ts-nocheck
import { Scenes, Markup } from 'telegraf';
import type {CharacterService} from '@/arena/CharacterService';
import MagicService from '@/arena/MagicService';
import type { BotContext } from '@/fwo';
import { getMagicDescription } from './utils';

export const magicScene = new Scenes.BaseScene<BotContext>('magics');

const getMagicButtons = (character: CharacterService) => {
  const knownMagics = MagicService.getMagicListByIds(Object.keys(character.magics));
  return knownMagics.map((magic) => [Markup.button.callback(
    `${magic.displayName}: ${character.magics[magic.name]}`,
    `about_${magic.name}`,
  )]);
};

const getMagicLvlButtons = (character: CharacterService) => {
  const maxMagicLvl = Math.min(character.lvl, 5, character.bonus);
  return new Array<number>(maxMagicLvl).fill(0).map((_, i) => {
    const lvl = i + 1;
    const magics = MagicService.getMagicListByProf(character.prof, lvl);
    const knownMagics = magics.filter((magic) => character.magics[magic.name]);
    const learntMagics = knownMagics.filter((magic) => {
      return character.magics[magic.name] === MagicService.MAX_MAGIC_LVL;
    });

    return [
      Markup.button.callback(`Круг ${lvl} ✔️${knownMagics.length}/${magics.length} 🌟${learntMagics.length}`, `learn_${lvl}`),
    ];
  });
};

magicScene.enter(async (ctx) => {
  await ctx.replyWithMarkdown(
    '*Магии*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize(),
  );

  await ctx.replyWithMarkdown(
    'Известные магии. Нажми на магию, чтобы узнать о ней больше',
    Markup.inlineKeyboard([
      ...getMagicButtons(ctx.session.character),
      [
        Markup.button.callback('Избранные магии', 'favorite'),
      ],
      [
        Markup.button.callback('Учить', 'selectLvl'),
        Markup.button.callback('В профиль', 'back'),
      ],
    ]),
  );
});

magicScene.action(/favorite$|favorite_add(?=_)|favorite_remove_\d/, async (ctx) => {
  const [, action, index, magicName] = ctx.match.input.split('_');

  if (action === 'add') {
    ctx.session.character.favoriteMagicList[Number(index)] = magicName;
    await ctx.session.character.saveToDb();
  }

  if (action === 'remove') {
    ctx.session.character.favoriteMagicList.splice(Number(index), 1);
    await ctx.session.character.saveToDb();
  }

  const favorites = MagicService.getMagicListByIds(ctx.session.character.favoriteMagicList);

  await ctx.editMessageText(
    'Выбери список магий, которые будут отображаться в бою',
    Markup.inlineKeyboard(
      [
        ...favorites.map((magic, i) => [
          Markup.button.callback(magic.displayName || '+', `favorite_select_${i}`),
          Markup.button.callback('-', `favorite_remove_${i}`),
        ]),
        [
          Markup.button.callback('+', `favorite_select_${favorites.length}`, favorites.length >= 5),
        ],
        [Markup.button.callback('Назад', 'magics')],
      ],
    ),
  );
});

magicScene.action(/favorite_select_\d/, async (ctx) => {
  const { magics, favoriteMagicList } = ctx.session.character;
  const [, , index] = ctx.match.input.split('_');

  const favoriteMagicSet = new Set(favoriteMagicList);
  const availableMagicIds = Object.keys(magics).filter((magic) => !favoriteMagicSet.has(magic));
  const availableMagicList = MagicService.getMagicListByIds(availableMagicIds);

  await ctx.editMessageText(
    availableMagicList.length ? 'Выбери магию' : 'Нет доступных магий для выбора',
    Markup.inlineKeyboard([
      ...availableMagicList.map((magic) => [Markup.button.callback(magic.displayName, `favorite_add_${index}_${magic.name}`)]),
      [Markup.button.callback('Назад', 'favorite')],
    ]),
  );
});

/** Ожидаем "learn_${lvl}", где lvl - уровень изучаемой магии */
magicScene.action('magics', async (ctx) => {
  await ctx.editMessageText(
    'Известные магии. Нажми на магию, чтобы узнать о ней больше',
    Markup.inlineKeyboard([
      ...getMagicButtons(ctx.session.character),
      [
        Markup.button.callback('Избранные магии', 'favorite'),
      ],
      [
        Markup.button.callback('Учить', 'selectLvl'),
        Markup.button.callback('В профиль', 'back'),
      ],
    ]),
  );
});

magicScene.action(/selectLvl|learn(?=_)/, async (ctx) => {
  const [, magicLvl] = ctx.match.input.split('_');
  const oldBonus = ctx.session.character.bonus;

  if (magicLvl) {
    try {
      const newMagic = await MagicService.learnMagic(ctx.session.character, Number(magicLvl));
      await ctx.answerCbQuery(`Изучена магия ${newMagic.displayName} до уровня ${ctx.session.character.magics[newMagic.name]}`);
    } catch (e) {
      await ctx.answerCbQuery(e.message);
    }
  }

  const newBonus = ctx.session.character.bonus;

  if (!magicLvl || oldBonus !== newBonus) {
    await ctx.editMessageText(
      `Выбери уровень изучаемой магии. Стоимость изучения равна уровню магии (*${ctx.session.character.bonus}💡*)`,
      {
        ...Markup.inlineKeyboard([
          ...getMagicLvlButtons(ctx.session.character),
          [
            Markup.button.callback('Назад', 'magics'),
          ],
        ]),
        parse_mode: 'Markdown',
      },
    );
  }
});

/** Ожидаем "about_${name}", где name - название магии */
magicScene.action(/(?<=about_)\w+/, async (ctx) => {
  const [magicName] = ctx.match;
  const magic = MagicService.getMagicById(magicName);
  const currentLvl = ctx.session.character.magics[magicName];

  await ctx.editMessageText(
    getMagicDescription(magic, currentLvl),
    {
      ...Markup.inlineKeyboard([
        Markup.button.callback('Назад', 'magics'),
      ]),
      parse_mode: 'Markdown',
    },
  );
});

magicScene.action('back', async (ctx) => {
  await ctx.scene.enter('profile');
});

magicScene.hears('🔙 В лобби', async (ctx) => {
  await ctx.scene.enter('lobby');
});
