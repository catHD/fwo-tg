import { bold, italic } from '../../utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Увертка
 */
class Dodge extends Skill {
  constructor() {
    super({
      name: 'dodge',
      displayName: '🐍 Увертка',
      desc: 'Шанс увернуться от одной или нескольких атак(только против колющего, режущего, рубящего, метательного, оглушающего оружия)',
      cost: [10, 12, 14, 16, 18, 20],
      proc: 20,
      baseExp: 50,
      costType: 'en',
      orderType: 'self',
      aoeType: 'target',
      chance: [75, 80, 85, 90, 95, 99],
      effect: [1.2, 1.25, 1.3, 1.35, 1.4, 1.45],
      profList: { l: 2 },
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name];
    initiator.flags.isDodging = this.effect[initiatorSkillLvl - 1] * initiator.stats.val('dex');
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator)} использовал ${italic(this.displayName)}`;
  }
}

export default new Dodge();
