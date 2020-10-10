import { bold, italic } from '../../utils/formatString';
import BattleLog, { SuccessArgs } from '../BattleLog';
import { DmgMagic } from '../Constuructors/DmgMagicConstructor';

/**
 * Магическая стрела
 * Основное описание магии общее требовани есть в конструкторе
 */
class MagicArrow extends DmgMagic {
  private case = 'Магической стрелой';

  constructor() {
    super({
      name: 'magicArrow',
      displayName: 'Магическая стрела',
      desc: 'Магическая стрела',
      cost: 3,
      baseExp: 8,
      costType: 'mp',
      lvl: 1,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d2', '1d2+1', '1d2+2'],
      dmgType: 'clear',
      profList: ['m'],
    });
  }

  /**
   * Основная функция запуска магии
   */
  run(): void {
    const { target } = this.params;
    target.stats.mode('down', 'hp', this.effectVal());
  }

  customMessage(args: SuccessArgs): string {
    const { initiator, target } = args;
    const exp = BattleLog.getDmgExpString(args);
    return `${bold(initiator)} выстреливает ${italic(this.case)} в ${bold(target)} ${exp}`;
  }
}

export default new MagicArrow();
