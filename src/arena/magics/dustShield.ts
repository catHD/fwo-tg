import _ from 'lodash';
import { LongMagic } from '../Constuructors/LongMagicConstructor';
import { isPhysicalDamageResult, findByTarget } from '../Constuructors/utils';
import type GameService from '../GameService';
import type { Player } from '../PlayersService';

const minProtect = 5;
const maxProtect = 20;

class DustShield extends LongMagic {
  constructor() {
    super({
      name: 'dustShield',
      displayName: 'Щит праха',
      desc: 'Щит из праха повышает защиту кастера на величину, результат деления количества повреждений предыдущего раунда на количество атакеров, но не больше 20 и не меньше 5.',
      cost: 14,
      baseExp: 8,
      costType: 'mp',
      lvl: 4,
      orderType: 'self',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      profList: ['p'],
      effect: ['1d3', '1d5', '1d7'],
    });
  }

  run(initiator: Player, target: Player, game: GameService): void {
    const effect = this.effectVal({ initiator, target, game });

    const results = game.getLastRoundResults();
    const physicalDamageResults = results
      .filter(isPhysicalDamageResult)
      .filter(findByTarget(target.nick));

    const damageTaken = physicalDamageResults.reduce((sum, { dmg }) => sum + dmg, 0);
    const protect = effect + damageTaken / physicalDamageResults.length;

    target.stats.up('pdef', _.clamp(protect, minProtect, maxProtect));
  }

  runLong(initiator: Player, target: Player, game: GameService): void {
    this.run(initiator, target, game);
  }

  calculateExp(effect: number, baseExp = 0): number {
    return Math.round(baseExp * effect);
  }
}

export default new DustShield();
