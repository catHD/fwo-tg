import type Char from './CharacterService';
import LearnError from './errors/LearnError';
import * as skills from './skills';

export type SkillsNames = keyof typeof skills;

export default class SkillService {
  static skills = skills;

  static async learn(char: Char, skillId: SkillsNames): Promise<Char> {
    const skill = SkillService.skills[skillId];
    const charSkillLvl = char.skills[skillId] ?? 0;
    if (skill.lvl > char.lvl) {
      throw new LearnError('Твой уровень ниже уровня умения');
    }
    if (skill.bonusCost[charSkillLvl] > char.bonus) {
      throw new LearnError('Не хватает бонусов');
    }
    if (charSkillLvl + 1 > skill.bonusCost.length) {
      throw new LearnError(`Умение ${skill.displayName} имеет максимальный уровень`);
    }
    char.bonus -= skill.bonusCost[charSkillLvl];
    await char.learnSkill(skillId, charSkillLvl + 1);
    return char;
  }

  static skillDescription(skillId: SkillsNames, char: Char): string {
    const {
      displayName, desc, lvl, bonusCost,
    } = SkillService.skills[skillId];
    const charSkillLvl = char.skills[skillId] ?? 0;

    return `${displayName} (${charSkillLvl === 0 ? 'Не изучено' : charSkillLvl})

${desc} ${char.lvl < lvl ? '\n\n❗️Твой уровень ниже уровня умения' : ''}

${charSkillLvl >= bonusCost.length ? 'Изучен максимальный уровень умения'
    : `Стоимость изучения: ${bonusCost[charSkillLvl]}💡 (${char.bonus}💡) ${bonusCost[charSkillLvl] > char.bonus ? '❗️' : '✅'}`
}`;
  }
}
