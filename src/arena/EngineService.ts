import arena from '@/arena';
import { type ActionKey, ActionService } from '@/arena/ActionService';
import type Game from '@/arena/GameService';
import config from '@/arena/config';
import _ from 'lodash';

type Stages = Readonly<(ActionKey | Readonly<ActionKey[]>)[]>;

/**
 * @param stages массив строк
 * @param game объект игры
 * @return измененный объект игры
 */
function runStage(stages: Stages, game: Game) {
  const ordersByAction = Object.groupBy(game.orders.ordersList, ({ action }) => action);
  stages.forEach((stage) => {
    if (typeof stage !== 'string') {
      runStage(stage, game);
      return;
    }

    console.log('stage run:', stage);
    if (!ActionService.isAction(stage)) {
      console.log('stage fail (unknown action):', stage);
      return;
    }
    const action = arena.actions[stage];
    const orders = ordersByAction[stage];
    if (!orders) {
      return;
    }

    orders.forEach((order) => {
      const initiator = game.players.getById(order.initiator);
      const target = game.players.getById(order.target);
      if (initiator && target) {
        // FIXME прокидывать проценты в action вместо initiator
        initiator.setProc(order.proc / 100);
        action.cast(initiator, target, game);
      } else {
        console.log('stage fail (no player):', initiator?.id, target?.id);
      }
    });

    if ('castLong' in action) {
      action.castLong(game);
    }
  });
  return game;
}

/**
 * Engine
 * Модуль обработки боя
 * @todo wip
 */

/**
 * @param game Объект игры
 */
export function engine(game: Game): Game | undefined {
  try {
    return runStage(config.stages, game);
  } catch (e) {
    console.debug(e);
  } finally {
    console.info('engine done');
  }
}
