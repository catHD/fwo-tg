const db = require('./dataBase');
const Inventory = require('../models/inventory');

module.exports = {
  /*
  @func проверка наличия персонажа у заданного tgId (пользователя телеги)
  @return Boolean
   */
  async check(tgId) {
    const re = await db.char.find({ tgId });
    return !!re;
  },
  /*
  @func проверка ника
  @return Boolean Наличие живого ника в базе
   */
  async checkNick(nickname) {
    const re = await db.char.findNick(nickname);
    return !!re;
  },
  /*
  @func регистрация чара
  @param {Number} tgId идентификатор телеграмма
  @param {String} prof id чара
   */
  async regChar(tgId, prof, nickname, sex) {
    const h = {};
    switch (prof) {
      case 'Воин':
        h.prof = 'w';
        h.harks = {
          str: 10,
          dex: 8,
          int: 3,
          wis: 3,
          con: 6,
        };
        break;

      case 'Лучник':
        h.prof = 'l';
        h.harks = {
          str: 3,
          dex: 8,
          int: 10,
          wis: 3,
          con: 6,
        };
        break;

      case 'Маг':
        h.prof = 'm';
        h.harks = {
          str: 3,
          dex: 3,
          int: 8,
          wis: 10,
          con: 6,
          mag: {
            magic_arrow: 1,
          },
        };
        break;

      case 'Лекарь':
        h.prof = 'p';
        h.harks = {
          str: 3,
          dex: 3,
          int: 10,
          wis: 8,
          con: 6,
          mag: {
            light_heal: 1,
          },
        };
        break;

      default:
        // eslint-disable-next-line no-console
        console.log('prof was', prof);
        break;
    }

    if (!h) throw new Error('prof error');
    h.sex = sex;
    h.tgId = tgId;
    h.nickname = nickname;
    // eslint-disable-next-line consistent-return
    const resp = await db.char.create(h);
    // eslint-disable-next-line no-underscore-dangle
    await Inventory.firstCreate(resp._id, resp.prof);
    return resp;
  },
  /*
  @func удаления
  @return Boolean
   */
  async remove(tgId) {
    const resp = await db.char.remove(tgId);
    return !!resp;
  },
  /**
   * @function
   * @return {Object} обьект персонажа
   */
  // eslint-disable-next-line consistent-return
  async getChar(tgId) {
    try {
      return await db.char.find({ tgId });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  },
  // eslint-disable-next-line consistent-return
  async saveHarks(tgId, params) {
    try {
      const resp = await db.char.update(tgId, params);
      return !!resp;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  },
};
