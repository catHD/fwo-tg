const ee = require('events');

/**
 * Класс вывода данных в battlelog
 * @todo WIP класс в стадии формирования
 * @see https://trello.com/c/qxnIM1Yq/17
 */
class BattleLog extends ee {
  /**
   * Конструктор обьекта ведущего логику отдачи сообщений для пользовательского
   * BattleLog
   */
  constructor() {
    super();
    this.msgArray = [];
  }

  /**
   * Функция логирует действия в console log
   * @param {Object} msgObj тип сообщения
   */
  log(msgObj) {
    let data = csl(msgObj);
    this.write(data);
  }

  /**
   * Удачный проход action
   * @param {Object} msgObj тип сообщения
   */
  success(msgObj) {
    let data = '';
    // Если обьект содержит кастомную строку испльзуем её
    if (msgObj.msg) {
      data = msgObj.msg(msgObj.initiator, msgObj.exp);
    } else if (msgObj.dmgType) {
      // магия является атакующей
      data = `${msgObj.initiator} сотворил ${msgObj.action} (${msgObj.actionType}) на ${msgObj.target} нанеся ${msgObj.dmg} урона и получил +e:${msgObj.exp}`;
    } else if (!msgObj.effect) {
      data = `${msgObj.initiator} использовал ${msgObj.action} (${msgObj.actionType}) на ${msgObj.target} и получил +e:${msgObj.exp}`;
    } else {
      data = `${msgObj.initiator} использовав ${msgObj.action} на ${msgObj.target} с эффектом ${msgObj.effect} получил +e:${msgObj.exp}`;
    }
    sails.log.info(data);
    this.write(data);
  }

  /**
   * Функция отправки сообщений в Game
   * @param {Object} data обьект сообщения
   */
  write(data) {
    this.emit('BattleLog', data);
  }
}

/**
 * msg
 * @param {Object} msgObj тип сообщения
 * @todo WIP, функция должна будет принимать как значения урона т.п так и
 * уметь работать с i18n
 * сейчас (е) не обрабатывается, нужно обрабатывать только нужный тип Error
 * если это не BattleLog выброс, его нужно прокидывать дальше вверх
 * @return {Object} ({type:String,message:String})
 */
function csl(msgObj) {
  sails.log(msgObj);
  let magic = msgObj.action;
  let msg = msgObj.message;
  let actionType = msgObj.actionType;
  let failReason = msgObj.failReason;
  let t = msgObj.target;
  let i = msgObj.initiator;
  const TEXT = {
    NO_MANA: {
      ru: `Нехватило манны для заклинания ${magic}`, eng: '',
    }, SILENCED: {
      ru: `${i} пытался сотворить ${magic} но попытка провалилась(затыка)`,
      eng: '',
    }, DEF: {
      ru: `${i} атаковал ${t} но тот смог защититься[${failReason}]`, eng: '',
    }, CHANCE_FAIL: {
      ru: `${i} пытался сотворить ${magic}, но у него не вышло`, end: '',
    }, GOD_FAIL: {
      ru: `Заклинание ${magic} ${i} провалилось по воле богов `, end: '',
    },
  };
  let text = TEXT[msg] || {
    ru: 'Ошибка парсинга строки магии',
  };
  sails.log.info(actionType, 'MSG:', text.ru);
  //@todo сейчас battleLog на стороне клиента не понимает типы магий, и
  // просто отображает оплученную строку
  return text.ru;
}

module.exports = BattleLog;