import _ from 'lodash';
import type { UpdateQuery } from 'mongoose';
import { findCharacter, updateCharacter } from '@/api/character';
import arena from '@/arena';
import config from '@/arena/config';
import { InventoryService } from '@/arena/InventoryService';
import type { HarksLvl } from '@/data/harks';
import type { Char } from '@/models/character';
import type { Character, CharacterClass, CharacterPublic } from '@fwo/schemas';
import { assignWithSum } from '@/utils/assignWithSum';
import { calculateDynamicAttributes } from './utils/calculate-dynamic-attributes';

/**
 * Конструктор персонажа
 * @todo сюда нужны будет get/set функции для intreface части
 * @todo Сейчас массив arena.player не является массивом объектов Character,
 * нужно переработать
 */

/**
 * Класс описывающий персонажа внутри игры
 */
export class CharacterService {
  tempHarks: HarksLvl & { free: number };
  mm: { status?: string; time?: number };
  inventory: InventoryService;

  /**
   * Конструктор игрока
   */
  constructor(public charObj: Char) {
    this.inventory = new InventoryService(charObj, charObj.inventory ?? []);
    this.charObj = charObj;
    this.tempHarks = {
      ...charObj.harks,
      free: charObj.free,
    };
    this.mm = {};
    this.resetExpLimit();
  }

  wasLvlUp = false;
  autoreg = false;

  get id() {
    return this.charObj.id;
  }

  get prof() {
    return this.charObj.prof;
  }

  get lvl() {
    return this.charObj.lvl;
  }

  // Суммарный объект характеристик + вещей.
  get dynamicAttributes() {
    const characterAttributes = structuredClone(this.attributes);
    const inventoryAttributes = this.inventory.attributes;

    assignWithSum(characterAttributes, inventoryAttributes);
    const dynamicHarks = calculateDynamicAttributes(this, characterAttributes);
    assignWithSum(dynamicHarks, this.inventory.harksFromItems);
    return dynamicHarks;
  }

  get owner() {
    return this.charObj.owner;
  }

  get nickname() {
    return this.charObj.nickname;
  }

  get gold() {
    return this.charObj.gold;
  }

  set gold(value) {
    this.charObj.gold = value;
  }

  get exp() {
    return this.charObj.exp;
  }

  set exp(value) {
    this.resetExpLimit();
    this.bonus += Math.round(value / 100) - Math.round(this.charObj.exp / 100);
    this.charObj.exp = value;
    void this.addLvl();
  }

  set expEarnedToday(value) {
    this.charObj.expLimit.earn = value;
  }

  get expEarnedToday() {
    return this.charObj.expLimit.earn;
  }

  get expLimitToday() {
    return this.lvl * config.lvlRatio * 2000;
  }

  get games() {
    return this.charObj.statistics.games;
  }

  get kills() {
    return this.charObj.statistics.kills;
  }

  get runs() {
    return this.charObj.statistics.runs;
  }

  get death() {
    return this.charObj.statistics.death;
  }

  get free() {
    return this.tempHarks.free;
  }

  set free(value) {
    this.charObj.free = value;
    this.tempHarks.free = value;
  }

  // Базовые harks без учёта надетых вещей
  get attributes() {
    return this.charObj.harks;
  }

  get magics() {
    return this.charObj.magics || {};
  }

  get skills() {
    return this.charObj.skills || {};
  }

  get bonus() {
    return this.charObj.bonus;
  }

  set bonus(value) {
    this.charObj.bonus = value;
  }

  get clan() {
    return this.charObj.clan;
  }

  /** Суммарное количество опыта, требуемое для следующего уровня */
  get nextLvlExp() {
    return 2 ** (this.lvl - 1) * 1000 * config.lvlRatio;
  }

  get favoriteMagicList() {
    return this.charObj.favoriteMagicList;
  }

  /** @type {string[]} */
  set favoriteMagicList(value) {
    this.charObj.favoriteMagicList = value;
  }

  resetExpLimit() {
    const date = new Date();
    if (date > this.charObj.expLimit.expiresAt) {
      date.setUTCHours(24, 0, 0, 0);
      this.charObj.expLimit.expiresAt = date;
      this.charObj.expLimit.earn = 0;
    }
  }

  /**
   * @param {Partial<Statistics>} stat
   */
  addGameStat(stat) {
    _.forEach(stat, (val, key) => {
      this.charObj.statistics[key] += val;
    });
  }

  /**
   * @param {string} reason
   */
  getPenaltyDate(reason) {
    const penalty = this.charObj.penalty.find((p) => p.reason === reason);
    if (penalty && penalty.date.valueOf() > Date.now()) {
      return penalty.date;
    }
    return false;
  }

  /**
   * @param {string} reason
   * @param {number} minutes
   */
  async updatePenalty(reason, minutes) {
    const date = new Date();
    date.setHours(date.getHours(), date.getMinutes() + minutes);

    const penalty = { reason, date };
    const index = this.charObj.penalty.findIndex((p) => p.reason === reason);

    if (index === -1) {
      this.charObj.penalty.push(penalty);
    } else {
      this.charObj.penalty[index] = penalty;
    }
    await this.saveToDb();
  }

  /**
   * Проверяет количество опыта для следующего уровня. Добавляет уровень, если опыта достаточно
   * @returns {void}
   */
  async addLvl() {
    if (this.exp >= this.nextLvlExp) {
      this.charObj.lvl += 1;
      this.free += 10;
      await this.addLvl();
      this.wasLvlUp = true;
    } else {
      await this.saveToDb();
    }
  }

  // В функциях прокачки харок следует использоваться this.charObj.harks
  getIncreaseHarkCount(hark) {
    const count = this.tempHarks[hark] - this.charObj.harks[hark];
    return count || '';
  }

  increaseHark(harkName) {
    if (this.tempHarks.free < 1) {
      throw Error('Недостаточно очков');
    }

    this.tempHarks[harkName] += 1;
    this.tempHarks.free -= 1;
  }

  resetHarks() {
    this.tempHarks = {
      ...this.charObj.harks,
      free: this.charObj.free,
    };
  }

  async submitIncreaseHarks({ free, ...harks } = this.tempHarks) {
    this.charObj.harks = harks;
    this.charObj.free = free;

    // @todo сюда нужно будет предусмотреть проверки на корректность сохраняемых данных
    return this.save({ harks, free });
  }

  async buyItem(itemCode) {
    const item = arena.items[itemCode];

    if (this.gold < item.price) {
      return false;
    }

    this.gold -= item.price;
    await this.inventory.addItem(itemCode);
    return this.saveToDb();
  }

  /**
   * Продажа предмета.
   */
  async sellItem(itemId) {
    const inventory = this.inventory.getItem(itemId);
    if (!inventory) {
      return;
    }
    const item = arena.items[inventory.code];

    await this.inventory.removeItem(itemId);

    this.gold += item.price / 2;
    await this.saveToDb();
  }

  /**
   * @param {Clan} clan
   */
  async joinClan(clan) {
    this.charObj.clan = clan;
    await this.saveToDb();
    const char = await CharacterService.getCharacter(this.owner);
    return char;
  }

  async leaveClan() {
    this.charObj.clan = undefined;
    await this.updatePenalty('clan_leave', 5 * 24 * 60);
  }

  /**
   * @desc Получает идентификатор игры из charId участника
   * @return gameId идентификатор игры
   */
  get gameId() {
    return this.mm.status || '';
  }

  /**
   * Setter gameId
   * @param newStatus новый статус mm персонажа
   */
  set gameId(newStatus) {
    this.mm.status = newStatus;
  }

  get currentGame() {
    return arena.games[this.gameId];
  }

  /**
   * Загрузка чара в память
   * @param {string} owner идентификатор пользователя в TG (tgId)
   */
  static async getCharacter(owner: string) {
    const charFromDb = await findCharacter({ owner });

    const char = new CharacterService(charFromDb);
    arena.characters[char.id] = char;
    return char;
  }

  /**
   * Загрузка чара в память
   * @param {string} id идентификатор пользователя
   */
  static async getCharacterById(id: string) {
    const cachedChar = arena.characters[id];
    if (cachedChar) {
      return cachedChar;
    }

    const charFromDb = await findCharacter({ _id: id });

    const char = new CharacterService(charFromDb);
    arena.characters[id] = char;
    return char;
  }

  /**
   * Возвращает объект игры по Id чара
   * @param {String} charId идентификатор чара;
   * @return {this} Объект игры
   * @todo нужно перенести это не в static а во внутрь экземпляра класса
   */
  static getGameFromCharId(charId) {
    const { gameId } = arena.characters[charId];
    if (arena.games[gameId]) {
      return arena.games[gameId];
    }
    throw Error('gameId_error');
  }

  /**
   * Функция получения новой магии
   * @param magicId идентификатор магии
   * @param lvl уровень проученной магии
   */
  async learnMagic(magicId: string, lvl: number) {
    this.magics[magicId] = lvl;
    // опасный тест
    await this.saveToDb();
  }

  /**
   * Получение нового умения
   * @param {string} skillId идентификатор умения
   * @param {number} lvl уровень проученного умения
   */
  async learnSkill(skillId, lvl) {
    this.skills[skillId] = lvl;
    await this.saveToDb();
  }

  /**
   * Сохраняет состояние чара в базу
   * @param {import('mongoose').UpdateQuery<import ('@/models/character').Char>} [query]
   */
  async save(query: UpdateQuery<Char>) {
    console.log('Saving char :: id', this.id);
    try {
      return await updateCharacter(this.id, query);
    } catch (e) {
      console.error('Fail on CharSave:', e);
    }
  }

  /**
   * Сохраняет состояние чара в базу
   * @todo важная функция которая сохраняет параметры чара в базу
   * @deprecated
   */
  async saveToDb() {
    try {
      console.log('Saving char :: id', this.id);
      const { gold, exp, magics, bonus, skills, lvl, clan, free } = this;
      return await updateCharacter(this.id, {
        gold,
        exp,
        magics,
        bonus,
        skills,
        lvl,
        clan,
        penalty: this.charObj.penalty,
        free,
        expLimit: this.charObj.expLimit,
        statistics: this.charObj.statistics,
        favoriteMagicList: this.charObj.favoriteMagicList,
      });
    } catch (e) {
      console.error('Fail on CharSave:', e);
    }
  }

  toObject(): Character {
    return {
      owner: this.owner,
      name: this.nickname,
      class: this.prof as CharacterClass,
      attributes: this.attributes,
      magics: this.magics,
      skills: this.skills,
      clan: this.clan,
      inventory: this.inventory.toObject(),
      bonus: this.charObj.bonus,
      gold: this.gold,
      lvl: this.lvl,
      exp: this.exp,
    };
  }

  toPublicObject(): CharacterPublic {
    return {
      name: this.nickname,
      class: this.prof as CharacterClass,
      lvl: this.lvl,
      clan: this.clan,
    };
  }
}
