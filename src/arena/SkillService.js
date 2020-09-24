/**
 * Сервис работы с умениями
 * @typedef {import ('./Constuructors/SkillConstructor')} Skill
 * @typedef {import ('./CharacterService')} Char
 */
const skills = require('./skills');
const arena = require('./index');

module.exports = {
  skills,
  /**
   * @param {string} charId идентификатор персонажа
   * @param {string} skillId идентификатор умения
   */
  learn(charId, skillId) {
    const skill = this.skills[skillId];
    /** @type {Char} */
    const char = arena.characters[charId];
    const charSkillLvl = char.skills[skillId] || 0;
    if (skill.lvl > char.lvl) {
      throw Error('Твой уровень ниже уровня умения');
    }
    if (skill.bonusCost[charSkillLvl] > char.bonus) {
      throw Error('Не хватает бонусов');
    }
    if (charSkillLvl + 1 > skill.bonusCost.length) {
      throw Error(`Умение ${skill.name} имеет максимальный уровень`);
    }
    char.bonus -= skill.bonusCost[charSkillLvl];
    char.learnSkill(skillId, charSkillLvl + 1);
    return char;
  },
  /**
   * Возвращает название и описание умения
   * @param {string} skillId идентификатор умения
   */
  show(skillId) {
    const {
      name, desc, lvl, bonusCost, displayName
    } = this.skills[skillId];
    return {
      name, desc, lvl, bonusCost, displayName,
    };
  },
  /**
   * Возвращает описание умения
   * @todo
   * @param {string} skillId
   * @param {Char} char
   */
  skillDescription(skillId, char) {
    const {
      displayName, desc, lvl, bonusCost,
    } = this.show(skillId);
    const charSkillLvl = char.skills[skillId] || 0;

    return `${displayName} (${charSkillLvl === 0 ? 'Не изучено' : charSkillLvl})

${desc} ${char.lvl < lvl ? '\n\n❗️Твой уровень ниже уровня умения' : ''}

${charSkillLvl >= bonusCost.length ? 'Изучен максимальный уровень умения'
    : `Стоимость изучения: ${bonusCost[charSkillLvl]}💡 (${char.bonus}💡) ${bonusCost[charSkillLvl] > char.bonus ? '❗️' : '✅'}`
}`;
  },
};
