import type { BreaksMessage, FailArgs } from '@/arena/Constuructors/types';

/**
 * msg
 * @todo WIP, функция должна будет принимать как значения урона т.п так и
 * уметь работать с i18n
 * сейчас (е) не обрабатывается, нужно обрабатывать только нужный тип Error
 * если это не BattleLog выброс, его нужно прокидывать дальше вверх
 */
export function formatError(msgObj: FailArgs): string {
  const {
    action, message, target, initiator,
  } = msgObj;

  const expString = 'expArr' in msgObj ? msgObj.expArr.map(({ name, exp }) => `${name}: 📖${exp}`).join(', ') : '';
  const weapon = 'weapon' in msgObj ? msgObj.weapon.case : '';

  const TEXT: Record<BreaksMessage | 'default', Record<'en' | 'ru', string>> = {
    NO_INITIATOR: {
      ru: `Некто хотел использовать _${action}_ на игрока *${target}*, но исчез`,
      en: '',
    },
    NO_TARGET: {
      ru: `Цель для заклинания _${action}_ игрока *${initiator}* не была найдена`,
      en: '',
    },
    NO_MANA: {
      ru: `*${initiator}* пытался использовать _${action}_ на *${target}, но не хватило маны`,
      en: '',
    },
    NO_ENERGY: {
      ru: `*${initiator}* пытался применить  _${action}_, но не хватило энергии`,
      en: '',
    },
    SILENCED: {
      ru: `*${initiator}* пытался сотворить _${action}_, но попытка провалилась (безмолвие)`,
      en: '',
    },
    CHANCE_FAIL: {
      ru: `*${initiator}* пытался сотворить _${action}_, но у него не вышло`,
      en: '',
    },
    GOD_FAIL: {
      ru: `Заклинание _${action}_ *${initiator}* провалилось по воле богов`,
      en: '',
    },
    HEAL_FAIL: {
      ru: `*${initiator}* пытался _вылечить_ *${target}*, но тот был атакован`,
      en: '',
    },
    SKILL_FAIL: {
      ru: `*${initiator}* пытался использовать умение _${action}_, но у него не вышло`,
      en: '',
    },
    NO_WEAPON: {
      ru: `*${initiator}* пытался атаковать *${target}*, но у него не оказалось оружия в руках`,
      en: '',
    },
    DEF: {
      ru: `*${initiator}* атаковал *${target}* _${weapon}_, но тот смог защититься \\[${expString}]`,
      en: '',
    },
    DODGED: {
      ru: `*${initiator}* атаковал *${target}* _${weapon}_, но тот уклонился от атаки`,
      en: '',
    },
    ECLIPSE: {
      ru: `*${initiator}* попытался атаковал *${target}* но ничего не увидел во тьме`,
      en: '',
    },
    PARALYSED: {
      ru: `*${initiator}* попытался атаковал но был парализован 🗿`,
      en: '',
    },
    PARRYED: {
      ru: `*${initiator}* пытался атаковать *${target}*, но атака была \\[_Парированна_]`,
      en: '',
    },
    DISARM: {
      ru: `*${initiator}* пытался атаковать *${target}*, но оказался \\[_Обезаружен_]`,
      en: '',
    },
    default: {
      ru: 'Ошибка парсинга строки магии',
      en: '',
    },
  };

  const text = TEXT[message];

  if (!text) {
    console.log(message);
    return TEXT.default.ru;
  }
  // @todo сейчас battleLog на стороне клиента не понимает типы магий, и
  // просто отображает полученную строку
  return text.ru;
}
