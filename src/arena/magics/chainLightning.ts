import { floatNumber } from '@/utils/floatNumber';
import { AoeDmgMagic } from '../Constuructors/AoeDmgMagicConstructor';
import type GameService from '../GameService';
import type { Player } from '../PlayersService';
import { Magics } from '@/data';

/**
 * Цепь молний
 * Основное описание магии общее требовани есть в конструкторе
 */
class ChainLightning extends AoeDmgMagic {
  maxTargets = [3, 4, 5];

  getTargets() {
    const { initiator, target, game } = this.params;
    const magicLevel = initiator.getMagicLevel(this.name);
    const maxTargets = this.maxTargets[magicLevel - 1];

    return game.players.getPlayersByClan(target.clan?.id)
      .filter(({ alive }) => alive)
      .filter(({ id }) => id !== target.id)
      .slice(0, maxTargets - 1);
  }

  /**
   * Основная функция запуска магии
   */
  run(initiator: Player, target: Player, game: GameService): void {
    const effectVal = this.effectVal({ initiator, target, game });
    target.stats.down('hp', effectVal);

    const targets = this.getTargets();
    targets.forEach((target, index) => {
      this.runAoe(initiator, target, game, index);
    });
  }

  runAoe(initiator: Player, target: Player, game: GameService, index: number) {
    const multiplier = 1 - (index + 1) * 0.1; // -10% каждой следующей цели
    const effectVal = this.effectVal({ initiator, target, game });
    const hit = floatNumber(effectVal * multiplier);

    target.stats.down('hp', hit);

    this.status.expArr.push({
      initiator,
      target,
      val: hit,
      hp: target.stats.val('hp'),
    });
  }

  aoeEffectVal({ initiator, target, game } = this.params): number {
    const effect = this.getEffectVal({ initiator, target, game });
    return this.modifyEffect(effect, { initiator, target, game });
  }
}

export const chainLightning = new ChainLightning(Magics.baseParams.chainLightning);
