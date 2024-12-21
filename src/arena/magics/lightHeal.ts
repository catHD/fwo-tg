import { bold, italic } from '../../utils/formatString';
import type { SuccessArgs } from '../Constuructors/types';
import { HealMagic } from './heal';

class LightHeal extends HealMagic {
  constructor() {
    super({
      name: 'lightHeal',
      displayName: 'Слабое лечение',
      desc: 'Слабое лечение цели',
      cost: 3,
      baseExp: 10,
      costType: 'mp',
      lvl: 1,
      orderType: 'all',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      effect: ['1d2', '1d2+1', '1d2+2'],
      profList: ['m', 'p'],
    })
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target, effect } = args;
    return `${bold(initiator.nick)} применил ${italic(this.displayName)} на ${bold(target.nick)} излечив его на ${bold(`${effect}`)}`;
  }
}

export const lightHeal = new LightHeal();
