import type { CharacterService } from './CharacterService';
import ValidationError from './errors/ValidationError';
import * as skills from './skills';

export type SkillsNames = keyof typeof skills;

export default class SkillService {
  static skills = skills;

  static async learn(char: CharacterService, skillId: SkillsNames): Promise<CharacterService> {
    const skill = SkillService.skills[skillId];
    const charSkillLvl = char.skills[skillId] ?? 0;
    const skillLvl = skill.profList[char.prof] ?? 0;
    if (skillLvl > char.lvl) {
      throw new ValidationError('Твой уровень ниже уровня умения');
    }
    if (skill.bonusCost[charSkillLvl] > char.bonus) {
      throw new ValidationError('Не хватает бонусов');
    }
    if (charSkillLvl + 1 > skill.bonusCost.length) {
      throw new ValidationError(`Умение ${skill.displayName} имеет максимальный уровень`);
    }
    char.bonus -= skill.bonusCost[charSkillLvl];
    await char.learnSkill(skillId, charSkillLvl + 1);
    return char;
  }

  static skillDescription(skillId: SkillsNames, char: CharacterService): string {
    const {
      displayName, desc, profList, bonusCost,
    } = SkillService.skills[skillId];
    const charSkillLvl = char.skills[skillId] ?? 0;
    const skillLvl = profList[char.prof] ?? 0;

    return `${displayName} (${charSkillLvl === 0 ? 'Не изучено' : charSkillLvl})

${desc} ${char.lvl < skillLvl ? '\n\n❗️Твой уровень ниже уровня умения' : ''}

${charSkillLvl >= bonusCost.length ? 'Изучен максимальный уровень умения'
    : `Стоимость изучения: ${bonusCost[charSkillLvl]}💡 (${char.bonus}💡) ${bonusCost[charSkillLvl] > char.bonus ? '❗️' : '✅'}`
}`;
  }
}
