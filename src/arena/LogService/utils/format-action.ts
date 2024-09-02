import type { SuccessArgs } from '@/arena/Constuructors/types';
import { getWeaponAction } from '@/arena/MiscService';

export function formatAction(msgObj: SuccessArgs): string {
  if (msgObj.msg) {
    return msgObj.msg(msgObj);
  }

  switch (msgObj.actionType) {
    case 'heal':
      return `Игрок *${msgObj.target.nick}* был вылечен 🤲 на *💖${msgObj.effect}*`;
    case 'phys': {
      return `*${msgObj.initiator.nick}* ${getWeaponAction(msgObj.target, msgObj.weapon)} и нанёс *${msgObj.effect}* урона`;
    }
    case 'dmg-magic':
    case 'dmg-magic-long':
    case 'aoe-dmg-magic':
      return `*${msgObj.initiator.nick}* сотворил _${msgObj.action}_ на *${msgObj.target.nick}* нанеся ${msgObj.effect} урона`;
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
