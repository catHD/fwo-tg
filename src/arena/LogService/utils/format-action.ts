import type { SuccessArgs } from '@/arena/Constuructors/types';
import { getWeaponAction } from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';

export function formatAction(msgObj: SuccessArgs): string {
  if (msgObj.msg) {
    return msgObj.msg(msgObj);
  }

  const calculateEffect = () => {
    if (msgObj.expArr.length) {
      return msgObj.expArr.reduce((effect, { val }) => {
        return floatNumber(effect + (val || 0));
      }, msgObj.effect);
    }

    return msgObj.effect;
  };

  switch (msgObj.actionType) {
    case 'heal':
      return `Игрок *${msgObj.target}* был вылечен 🤲 на *💖${msgObj.effect}*`;
    case 'phys': {
      return `*${msgObj.initiator}* ${getWeaponAction(msgObj.target, msgObj.weapon)} и нанёс *${msgObj.effect}* урона`;
    }
    case 'dmg-magic':
    case 'dmg-magic-long':
    case 'aoe-dmg-magic':
      return `*${msgObj.initiator}* сотворил _${msgObj.action}_ на *${msgObj.target}* нанеся ${calculateEffect()} урона`;
    case 'magic':
    case 'magic-long':
      return !msgObj.effect
        ? `*${msgObj.initiator}* использовал _${msgObj.action}_ на *${msgObj.target}*`
        : `*${msgObj.initiator}* использовал _${msgObj.action}_ на *${msgObj.target}* с эффектом ${msgObj.effect}`;
    case 'skill':
      return msgObj.orderType === 'self'
        ? `*${msgObj.initiator}* использовал _${msgObj.action}_`
        : `*${msgObj.initiator}* использовал _${msgObj.action}_ на *${msgObj.target}*`;
    default:
      return `*${msgObj.initiator}* использовал _${msgObj.action}_ на *${msgObj.target}*`;
  }
}
