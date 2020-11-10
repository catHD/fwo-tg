import { bold, italic } from '../../utils/formatString';
import type { SuccessArgs } from '../BattleLog';
import { Skill } from '../Constuructors/SkillConstructor';

/**
 * Парирование
 */
class Parry extends Skill {
  constructor() {
    super({
      name: 'parry',
      displayName: '🤺 Парирование',
      desc: 'Шанс спарировать одну атаку. На 6 уровне обучения парирование будет отбивать несколько атак.',
      cost: [8, 9, 10, 11, 12, 13],
      proc: 10,
      baseExp: 8,
      costType: 'en',
      orderType: 'self',
      aoeType: 'target',
      chance: [70, 75, 80, 85, 90, 95],
      effect: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6],
      profList: { w: 1 },
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name];
    const effect = this.effect[initiatorSkillLvl - 1] || 1;
    // изменяем
    initiator.flags.isParry = initiator.stats.val('dex') * effect;
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator)} использовал ${italic(this.displayName)}`;
  }
}

export default new Parry();
