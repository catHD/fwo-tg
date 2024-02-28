/* eslint-disable no-use-before-define */
import type { Item } from '../../models/item';
import type GameService from '../GameService';
import type { Player } from '../PlayersService';

export type CostType = 'en' | 'mp';
export type OrderType = 'all' | 'any' | 'enemy' | 'self' | 'team';
export type AOEType = 'target' | 'team';
export type DamageType = 'acid' | 'fire' | 'lighting' | 'frost' | 'physical' | 'clear';
export type BreaksMessage =
  'NO_INITIATOR' |
  'NO_TARGET' |
  'NO_MANA' |
  'NO_ENERGY' |
  'CHANCE_FAIL' |
  'GOD_FAIL' |
  'HEAL_FAIL' |
  'SKILL_FAIL' |
  'PHYS_FAIL' |
  'NO_WEAPON';

export type ExpArr = {
  name: string;
  id: string;
  exp?: number;
  val?: number;
  hp?: number;
}[];

export type CustomMessageFn = (args: SuccessArgs) => string;

export interface CustomMessage {
  customMessage?(args: SuccessArgs): string;
}

export interface LongCustomMessage extends CustomMessage {
  longCustomMessage?(args: SuccessArgs): string;
}

export interface AoeMagic {
  runAoe?(initiator: Player, target: Player, game: GameService, index: number): void;
  getTargets?(): Player[];
}

export type SuccessArgs = {
  actionType: ActionType;
  action: string;
  exp: number;
  initiator: string;
  target: string;
  effect: number;
  hp: number;
  expArr: ExpArr;
  weapon: Item | undefined
  effectType?: DamageType;
  orderType: OrderType;
  affects?: SuccessArgs[];
  msg?: CustomMessageFn;
}

export type ActionType = 'magic' | 'dmg-magic' | 'dmg-magic-long' | 'aoe-dmg-magic' | 'magic-long' | 'skill' | 'phys' | 'heal-magic' | 'heal' | 'protect';

export interface FailArgs {
  actionType: ActionType;
  reason: BreaksMessage | SuccessArgs | SuccessArgs[];
  action: string;
  initiator: string;
  target: string;
  weapon: Item | undefined;
}
