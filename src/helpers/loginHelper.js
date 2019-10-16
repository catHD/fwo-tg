const db = require('./dataBase');

module.exports = {
  /*
  @func проверка наличия персонажа у заданного tgId (пользователя телеги)
  @return Boolean
   */
  async check(tgId) {
    const re = await db.char.find(tgId);
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
    let h;
    switch (prof) {
      case 'Воин':
        h.harks = {
          prof: 'w',
          str: 10,
          dex: 8,
          int: 3,
          wis: 3,
          inventory: [
            {
              code: 'waa',
              putOn: true,
              place: 'a',
            }],
        };
        break;

      case 'Лучник':
        h.harks = {
          prof: 'l',
          str: 3,
          dex: 8,
          int: 10,
          wis: 3,
          inventory: [
            {
              code: 'wab',
              putOn: true,
              place: 'a',
            }],
        };
        break;

      case 'Маг':
        h.harks = {
          prof: 'm',
          str: 3,
          dex: 3,
          int: 8,
          wis: 10,
          mag: {
            magic_arrow: 1,
          },
          inventory: [
            {
              code: 'wac',
              putOn: true,
              place: 'a',
            }],
        };
        break;

      case 'Лекарь':
        h.harks = {
          prof: 'p',
          str: 3,
          dex: 3,
          int: 10,
          wis: 8,
          mag: {
            light_heal: 1,
          },
          inventory: [
            {
              code: 'wac',
              putOn: true,
              place: 'a',
            }],
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
    return db.char.create(h);
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
      return await db.char.find(tgId);
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
