const { BaseScene, Markup } = require('telegraf');
const arena = require('../arena');
const ClanService = require('../arena/ClanService');
const { default: ValidationError } = require('../arena/errors/ValidationError');
const { profs } = require('../data/profs');
const { ClanModel } = require('../models/clan');

/** @type {import('./stage').BaseGameScene} */
const clanScene = new BaseScene('clan');

const startScreen = {
  message: (clan) => `*${clan.name}*`,
  markup: (clan, isAdmin) => Markup.inlineKeyboard([
    [Markup.callbackButton('Список участников', 'players_list')],
    [Markup.callbackButton('Казна', 'add_gold')],
    [Markup.callbackButton(`Заявки на вступление (${clan.requests.length})`, 'requests_list')],
    [Markup.callbackButton(
      `Улучшить клан (-${ClanModel.lvlCost()[clan.lvl]}💰 +1👤)`,
      'lvlup',
      clan.lvl >= ClanModel.lvlCost().length,
    )],
    [Markup.callbackButton('Удалить клан', 'removeConfirm', !isAdmin)],
    [Markup.callbackButton('Покинуть клан', 'leave', isAdmin)],
  ]).resize().extra({ parse_mode: 'Markdown' }),
};

clanScene.enter(async ({ replyWithMarkdown, session }) => {
  await replyWithMarkdown(
    '*Клан*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );

  session.character = arena.characters[session.character.id];

  if (!session.character.clan) {
    replyWithMarkdown(
      'Сейчас ты не состоишь ни в одном клане',
      Markup.inlineKeyboard([
        Markup.callbackButton('Создать клан', 'create'),
        Markup.callbackButton('Вступить в клан', 'clanlist'),
      ]).resize().extra(),
    );
  } else {
    const clan = await ClanService.getClanById(session.character.clan.id);
    Object.assign(session.character.clan, clan);

    const isAdmin = clan.owner.tgId === session.character.tgId;

    replyWithMarkdown(
      startScreen.message(clan),
      startScreen.markup(clan, isAdmin),
    );
  }
});

clanScene.action(/^(lvlup|back|remove|leave)$/, async ({
  session, answerCbQuery, match, editMessageText,
}) => {
  const char = session.character;
  if (match.input === 'remove') {
    await ClanService.removeClan(char.clan.id);
    await answerCbQuery('Клан был удалён');
  }
  if (match.input === 'leave') {
    session.character = await ClanService.leaveClan(char.clan.id, char.tgId);
  }

  if (!session.character.clan) {
    editMessageText(
      'Сейчас ты не состоишь ни в одном клане',
      Markup.inlineKeyboard([
        Markup.callbackButton('Создать клан', 'create'),
        Markup.callbackButton('Вступить в клан', 'clanlist'),
      ]).resize().extra({
        parse_mode: 'Markdown',
      }),
    );
  } else {
    session.character = arena.characters[session.character.id];
    const clan = await ClanService.getClanById(session.character.clan.id);
    if (match.input === 'lvlup') {
      const cost = ClanModel.lvlCost()[clan.lvl];
      try {
        const updated = await clan.levelUp(clan.id);
        arena.clans[clan.id] = updated;
        answerCbQuery(`Клан достиг ${clan.lvl} уровня. Списано ${cost}💰`);
      } catch (e) {
        if (e instanceof ValidationError) {
          return answerCbQuery(e.message);
        }
        throw e;
      }
    }

    const isAdmin = clan.owner.tgId === session.character.tgId;

    editMessageText(
      startScreen.message(clan),
      startScreen.markup(clan, isAdmin),
    );
  }
});

clanScene.action('removeConfirm', ({ editMessageText }) => {
  editMessageText(
    'Вы действительно хотите удалить клан?',
    Markup.inlineKeyboard([
      Markup.callbackButton('Да', 'remove'),
      Markup.callbackButton('Нет', 'back'),
    ]).resize().extra(),
  );
});

clanScene.action(/add(?=_)/, async ({
  session, editMessageText, match, answerCbQuery,
}) => {
  const [, gold] = match.input.split('_');
  const clan = await ClanService.getClanById(session.character.clan.id);

  if (!Number.isNaN(Number(gold))) {
    try {
      await ClanService.addGold(clan.id, session.character.id, Number(gold));
      answerCbQuery(`Списано ${gold}💰`);
    } catch (e) {
      answerCbQuery(e.message);
    }
  }

  editMessageText(
    `В казне ${clan.gold}💰
Пополнить казну:`,
    Markup.inlineKeyboard([
      [10, 25, 50, 100, 250].map((val) => Markup.callbackButton(val, `add_${val}`)),
      [Markup.callbackButton('Назад', 'back')],
    ]).resize().extra(),
  );
});

clanScene.action('players_list', async ({ session, editMessageText }) => {
  const clan = await ClanService.getClanById(session.character.clan.id);
  const list = clan.players.map((player) => {
    const { nickname, prof, lvl } = player;
    return `${player.id === clan.owner.id ? '👑 ' : ''}*${nickname}* (${profs[prof].icon}${lvl})`;
  });
  editMessageText(
    `Список участников:
${list.join('\n')}`,
    Markup.inlineKeyboard([
      Markup.callbackButton('Назад', 'back'),
    ]).resize().extra({ parse_mode: 'Markdown' }),
  );
});

clanScene.action(/requests_list|(accept|reject)(?=_)/, async ({
  session, editMessageText, match, answerCbQuery,
}) => {
  const [action, tgId] = match.input.split('_');
  const clan = await ClanService.getClanById(session.character.clan.id);
  try {
    if (action === 'accept') {
      await ClanService.acceptRequest(clan.id, tgId);
    }
    if (action === 'reject') {
      await ClanService.rejectRequest(clan.id, tgId);
    }
  } catch (e) {
    answerCbQuery(e.message);
  }

  const isAdmin = clan.owner.tgId === session.character.tgId;

  const list = clan.requests.map((player) => {
    const { nickname, prof, lvl } = player;
    return [
      Markup.callbackButton(`${nickname} (${profs[prof].icon}${lvl})`, 'todo'),
      Markup.callbackButton('Принять', `accept_${player.tgId}`, !isAdmin),
      Markup.callbackButton('Отклонить', `reject_${player.tgId}`, !isAdmin),
    ];
  });
  editMessageText(
    'Список заявок:',
    Markup.inlineKeyboard([
      ...list,
      [Markup.callbackButton('Назад', 'back')],
    ]).resize().extra({ parse_mode: 'Markdown' }),
  );
});

clanScene.action(/clanlist|request(?=_)/, async ({
  session, editMessageText, answerCbQuery, match,
}) => {
  const [, id] = match.input.split('_');
  if (id) {
    try {
      await ClanService.handleRequest(session.character.id, id);
    } catch (e) {
      answerCbQuery(e.message);
    }
  }

  const list = await ClanService.getClanList(session.character.id);

  editMessageText(
    'Список доступных кланов:',
    Markup.inlineKeyboard([
      ...list,
      [Markup.callbackButton('Назад', 'back')],
    ]).resize().extra({ parse_mode: 'Markdown' }),
  );
});

clanScene.action('create', async ({ scene, deleteMessage }) => {
  await deleteMessage();
  scene.enter('createClan');
});

clanScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

module.exports = clanScene;
