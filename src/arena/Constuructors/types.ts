import type { Item } from '@fwo/schemas';
import type GameService from '../GameService';
import type { Player } from '../PlayersService';

export type CostType = 'en' | 'mp';
export type OrderType = 'all' | 'any' | 'enemy' | 'self' | 'team' | 'teamExceptSelf';
export type AOEType = 'target' | 'team';
export type DamageType = 'acid' | 'fire' | 'lighting' | 'frost' | 'physical' | 'clear';
export type BreaksMessage =
  | 'NO_INITIATOR'
  | 'NO_TARGET'
  | 'NO_MANA'
  | 'NO_ENERGY'
  | 'CHANCE_FAIL'
  | 'GOD_FAIL'
  | 'HEAL_FAIL'
  | 'SKILL_FAIL'
  | 'PHYS_FAIL'
  | 'NO_WEAPON';

export type ExpArr = {
  initiator: Player;
  target: Player;
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
  initiator: Player;
  target: Player;
  effect: number;
  hp: number;
  expArr: ExpArr;
  weapon: Item | undefined;
  effectType?: DamageType;
  orderType: OrderType;
  affects?: SuccessArgs[];
  msg?: CustomMessageFn;
};

export type ActionType =
  | 'magic'
  | 'dmg-magic'
  | 'dmg-magic-long'
  | 'aoe-dmg-magic'
  | 'magic-long'
  | 'skill'
  | 'phys'
  | 'heal-magic'
  | 'heal'
  | 'protect'
  | 'dodge'
  | 'passive'
  | 'regeneration';

export interface FailArgs {
  actionType: ActionType;
  reason: BreaksMessage | SuccessArgs | SuccessArgs[];
  action: string;
  initiator: Player;
  target: Player;
  weapon: Item | undefined;
}
