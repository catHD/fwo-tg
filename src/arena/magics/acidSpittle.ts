import { DmgMagic } from '../Constuructors/DmgMagicConstructor';

/**
 * Кислотный плевок
 * Основное описание магии общее требовани есть в конструкторе
 */
class AcidSpittle extends DmgMagic {
  constructor() {
    super({
      name: 'acidSpittle',
      displayName: 'Кислотный плевок',
      desc: 'Кислотный плевок',
      cost: 10,
      baseExp: 12,
      costType: 'mp',
      lvl: 3,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d3+3', '1d3+4', '1d3+5'],
      dmgType: 'acid',
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
}

export default new AcidSpittle();
