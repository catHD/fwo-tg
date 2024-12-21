import arena from '@/arena';
import type { Action, OrderType } from '@fwo/schemas';

export type ActionKey = keyof typeof arena.actions;

export class ActionService {
  static isAction(maybeAction: string): maybeAction is ActionKey {
    return maybeAction in arena.actions;
  }

  static isBaseAction(action: string) {
    if (ActionService.isAction(action)) {
      return arena.actions[action].lvl === 0;
    }

    return false;
  }

  static toObject(action: ActionKey): Action {
    const c = arena.actions[action];

    return {
      name: c.name,
      // lvl: c.lvl,
      costType: 'costType' in c ? c.costType : null,
      cost: 'cost' in c ? c.cost : null,
      orderType: c.orderType as OrderType,
    };
  }
}
