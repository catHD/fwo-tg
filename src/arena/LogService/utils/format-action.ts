import type { SuccessArgs } from '@/arena/Constuructors/types';
import MiscService from '@/arena/MiscService';
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
      return `Игрок *${msgObj.target.nick}* был вылечен 🤲 на *💖${msgObj.effect}*`;
    case 'phys': {
      return `*${msgObj.initiator.nick}* ${MiscService.getWeaponAction(msgObj.target, msgObj.weapon)} и нанёс *${msgObj.effect}* урона`;
    }
    case 'dmg-magic':
    case 'dmg-magic-long':
    case 'aoe-dmg-magic':
      return `*${msgObj.initiator.nick}* сотворил _${msgObj.action}_ на *${msgObj.target.nick}* нанеся ${calculateEffect()} урона`;
    case 'magic':
    case 'magic-long':
      return !msgObj.effect
        ? `*${msgObj.initiator.nick}* использовал _${msgObj.action}_ на *${msgObj.target.nick}*`
        : `*${msgObj.initiator.nick}* использовал _${msgObj.action}_ на *${msgObj.target.nick}* с эффектом ${msgObj.effect}`;
    case 'skill':
    case 'dodge':
      return msgObj.orderType === 'self'
        ? `*${msgObj.initiator.nick}* использовал _${msgObj.action}_`
        : `*${msgObj.initiator.nick}* использовал _${msgObj.action}_ на *${msgObj.target.nick}*`;
    case 'passive':
      return `_${msgObj.action}_`;
    default:
      return `*${msgObj.initiator.nick}* использовал _${msgObj.action}_ на *${msgObj.target.nick}*`;
  }
}
