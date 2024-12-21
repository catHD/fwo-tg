import { times } from 'lodash';
import { AoeDmgMagic } from '../Constuructors/AoeDmgMagicConstructor';
import type GameService from '../GameService';
import MiscService from '../MiscService';
import type { Player } from '../PlayersService';

class FireBall extends AoeDmgMagic {
  bounces = 4;
  aoeEffect = '1d2';

  constructor() {
    super({
      name: 'fireBall',
      displayName: 'Огненный шар',
      desc: 'Огненный шар',
      cost: 24,
      baseExp: 10,
      costType: 'mp',
      lvl: 5,
      orderType: 'enemy',
      aoeType: 'team',
      magType: 'bad',
      chance: [95, 95, 95],
      effect: ['1d3+5', '1d3+6', '1d3+7'],
      dmgType: 'fire',
      profList: ['m'],
    });
  }

  getTargets(): Player[] {
    const { target, game } = this.params;

    if (!target.clan) {
      return [target];
    }

    const targets = game.players
      .getPlayersByClan(target.clan?.id)
      .filter(({ alive }) => alive)
      .filter(({ id }) => id !== target.id);

    if (!targets.length) {
      return [target];
    }

    return targets;
  }

  run(initiator: Player, target: Player, game: GameService): void {
    const effect = this.effectVal({ initiator, target, game });
    target.stats.down('hp', effect);

    const targets = this.getTargets();

    times(this.bounces).forEach((value) => {
      const target = targets[value % targets.length];
      this.runAoe(initiator, target, game);
    });
  }

  runAoe(initiator: Player, target: Player, game: GameService) {
    const effect = this.aoeEffectVal({ initiator, target, game });

    target.stats.down('hp', effect);

    this.status.expArr.push({
      initiator,
      target,
      val: effect,
      hp: target.stats.val('hp'),
    });
  }

  aoeEffectVal({ initiator, target, game } = this.params): number {
    const effect = MiscService.dice(this.aoeEffect) * initiator.proc;
    return this.modifyEffect(effect, { initiator, target, game });
  }
}

export default new FireBall();
