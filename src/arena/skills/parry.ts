import { bold, italic } from '@/utils/formatString';
import { PreAffect } from '../Constuructors/PreAffect';
import { Skill } from '../Constuructors/SkillConstructor';
import { SuccessArgs } from '../Constuructors/types';

/**
 * Парирование
 */
class Parry extends Skill implements PreAffect {
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

  check({ initiator, target, game } = this.params) {
    const initiatorDex = initiator.stats.val('dex');

    if (target.flags.isParry) {
      if ((target.flags.isParry - initiatorDex) > 0) {
        this.getExp(target);

        return this.getSuccessResult({ initiator: target, target: initiator, game });
      }

      target.flags.isParry -= +initiatorDex;
    }
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator)} использовал ${italic(this.displayName)}`;
  }
}

export default new Parry();
