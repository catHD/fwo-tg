import { get, set } from 'lodash';
import { floatNumber } from '@/utils/floatNumber';
import type { CharacterDynamicAttributes } from '@fwo/schemas';
import type { PhysAttributes } from '@fwo/schemas';

type CombineAll<T> = T extends {[name in keyof T]: infer Type} ? Type : never

type PropertyNameMap<T, IncludeIntermediate extends boolean> = {
    [name in keyof T]: T[name] extends object ? (
        SubPathsOf<name, T, IncludeIntermediate> | (IncludeIntermediate extends true ? name : never) 
    ) : name
}

type SubPathsOf<key extends keyof T, T, IncludeIntermediate extends boolean> = (
    `${string & key}.${string & PathsOf<T[key], IncludeIntermediate>}`
)

export type PathsOf<T, IncludeIntermediate extends boolean = false> = CombineAll<PropertyNameMap<T,IncludeIntermediate>>

export type Stats = CharacterDynamicAttributes & {
  hp: number;
  mp: number;
  en: number;
  exp: number;
  static: PhysAttributes;
};

type StatsPath = PathsOf<Stats>
type StatsPathPartial = PathsOf<Stats, true>;

/**
 * Класс для хранения stats
 */
export default class StatsService {
  private inRound!: Stats;
  public readonly collect = { exp: 0, gold: 0 };
  /**
   * Конструктор класса stats
   * @param defStat объект параметров
   */
  constructor(
    private defStat: CharacterDynamicAttributes,
  ) {
    this.refresh();
  }

  up(atr: StatsPath, val: number): void {
    set(this.inRound, atr, floatNumber(this.val(atr) + val));
  }

  down(atr: StatsPath, val: number): void {
    set(this.inRound, atr, floatNumber(this.val(atr) - val));
  }

  mul(atr: StatsPath, val: number): void {
    set(this.inRound, atr, floatNumber(this.val(atr) * val));
    console.log('Mul:', atr, ' val:', val, 'new val:', this.inRound[atr]);
  }

  set(atr: StatsPath, val: number): void {
    this.inRound[atr] = floatNumber(val);
  }

  /**
   * Функция изменения атрибута
   * @param type тип изменения up/down
   * @param atr изменяемый атрибут atk/hark.str/def
   * @param val значение на которое будет изменено
   * изменение может происходить только внутри inRound
   * @deprecated use up/down/set methods instead
   */
  mode(type: 'up' | 'down' | 'set', atr: StatsPath, val: number): void {
    switch (type) {
      case 'up':
        this.up(atr, val)
        break;
      case 'down':
        this.down(atr, val)
        break;
      case 'set':
        this.set(atr, val)
        break;
      default:
        console.error('Stats mode type error', type);
        throw new Error('stat mode fail');
    }
    console.log('new stat:', this.inRound[atr], 'atr', atr, 'val', val);
  }

  /**
   * Функция обнуления состояние inRound Object
   */
  refresh(): void {
    const oldData = structuredClone(this.inRound ?? {}); // ссылаемся на внешний объект
    if (oldData.exp) {
      this.collect.exp += oldData.exp;
    }

    // выставляем ману и хп на начало раунда
    this.inRound = {
      ...structuredClone(this.defStat),
      hp: oldData.hp ?? this.defStat.base.hp, // @todo hardcord
      mp: oldData.mp ?? this.defStat.base.mp,
      en: oldData.en ?? this.defStat.base.en,
      exp: 0, // кол-во Exp на начало раунда
      static: structuredClone(this.defStat.phys),
    };
  }

  /**
   * Функция возвращающее значение атрибута
   * @param atr str/atk/prt/dex
   */
  val<T extends StatsPathPartial>(atr: T) {
    return get(this.inRound, atr);
  }

  /**
   * Добавление голда игроку
   * @param n кол-во gold
   */
  addGold(n = 0): void {
    this.collect.gold += +n;
  }
}
