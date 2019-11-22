/**
 * MongoHelper
 */
const CharModel = require('../models/character');
const GameModel = require('../models/games');
const InventoryModel = require('../models/inventory');

function dbErr(e) {
  throw new Error('Fail in dbHelper:', e);
}

module.exports = {
  char: {
    // eslint-disable-next-line consistent-return
    async find(query) {
      try {
        const x = await CharModel.findOne({ ...query, deleted: false });
        if (x) {
          // eslint-disable-next-line no-underscore-dangle
          x._doc.id = x._id;
          // eslint-disable-next-line no-underscore-dangle
          return x._doc;
        }
        return x;
      } catch (e) {
        dbErr(e);
      }
    },
    async save(charObj) {
      try {
        // @todo проверка на родителя и целостность обьекта
        await CharModel.save(charObj);
      } catch (e) {
        dbErr(e);
      }
    },
    // eslint-disable-next-line consistent-return
    async remove(tgId) {
      try {
        return await CharModel.findOneAndUpdate({ tgId, deleted: false }, { deleted: true });
      } catch (e) {
        dbErr(e);
      }
    },
    // eslint-disable-next-line consistent-return
    async create(charObj) {
      try {
        const x = new CharModel(charObj);
        x.save();
        // eslint-disable-next-line no-underscore-dangle
        return x._doc;
      } catch (e) {
        dbErr(e);
      }
    },
    /*
    @param Nick string имя персонажа
     */
    // eslint-disable-next-line consistent-return
    async findNick(nickname) {
      try {
        return await CharModel.findOne({ nickname, deleted: false });
      } catch (e) {
        dbErr(e);
      }
    },
    // eslint-disable-next-line consistent-return
    async update(tgId, params) {
      try {
        return await CharModel.findOneAndUpdate({ tgId, deleted: false }, params);
      } catch (e) {
        dbErr(e);
      }
    },
  },
  game: {
    // eslint-disable-next-line consistent-return
    async create(gameObject) {
      try {
        const x = new GameModel(gameObject);
        x.save();
        // eslint-disable-next-line no-underscore-dangle
        return x._doc;
      } catch (e) {
        dbErr(e);
      }
    },
  },
  inventory: {
    // eslint-disable-next-line consistent-return
    async getAllHarks(charId) {
      try {
        return await InventoryModel.fullHarks(charId);
      } catch (e) {
        dbErr(e);
      }
    },
    // eslint-disable-next-line consistent-return
    async getItems(charId) {
      try {
        return await InventoryModel.getItems(charId);
      } catch (e) {
        dbErr(e);
      }
    },
    async putOffItem(charId, itemId) {
      return InventoryModel.putOffItem(charId, itemId);
    },
    async putOnItem(charId, itemId) {
      return InventoryModel.putOnItem(charId, itemId);
    },
    async getItem(itemCode, charId) {
      return InventoryModel.getItem(itemCode, charId);
    },
  },
};
