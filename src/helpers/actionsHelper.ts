import arena from '@/arena';
import { ActionService } from '@/arena/ActionService';
import type { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';

export const getAvailableActions = (character: CharacterService) => {
  const game = arena.characters[character.id].currentGame;

  console.assert(game, 'actionsHelper: game not found');
  if (!game) {
    return [];
  }

  const player = game.players.getById(character.id);

  console.assert(player, 'actionsHelper: player %s not found', character.id);
  if (!player) {
    return [];
  }

  return ActionsHelper.buildActions(player, game);
};

export abstract class ActionsHelper {
  static hasMagicOrder(player: Player, game: GameService, magicNames: string[]) {
    return !magicNames.some((magicName) => game.orders.checkPlayerOrder(player.id, magicName));
  }

  static hasSkillOrder(player: Player, game: GameService, skillName: string) {
    return !game.orders.checkPlayerOrder(player.id, skillName);
  }

  static canProtect(player: Player, game: GameService) {
    const maxTargets = /w/.test(player.prof) ? 2 : 1;
    return maxTargets > game.orders.getNumberOfOrder(player.id, arena.actions.protect.name);
  }

  static canAttack(player: Player, game: GameService) {
    const maxTargets = player.stats.val('maxTarget');
    return maxTargets > game.orders.getNumberOfOrder(player.id, arena.actions.attack.name);
  }

  static getBasicActions(player: Player, game: GameService) {
    const actions: string[] = [];
    if (ActionsHelper.canAttack(player, game)) {
      actions.push(arena.actions.attack.name);
    }

    if (this.canProtect(player, game)) {
      actions.push(arena.actions.protect.name);
    }

    actions.push(arena.actions.regeneration.name);
    actions.push(arena.actions.handsHeal.name);

    return actions.map(ActionsHelper.formatAction).filter((action) => !!action);
  }

  static getPlayerMagics(player: Player) {
    const favoriteMagics = new Set(player.favoriteMagics);
    const magics = new Set(Object.keys(player.magics));

    return [...favoriteMagics, ...magics.difference(favoriteMagics)];
  }

  static getAvailableMagics(player: Player, game: GameService) {
    if (!/m|p/.test(player.prof)) return [];

    const magics = this.getPlayerMagics(player);

    if (this.hasMagicOrder(player, game, magics)) {
      return magics.map(ActionsHelper.formatAction).filter((action) => !!action);
    }

    return [];
  }

  static getAvailableSkills(player: Player, game: GameService) {
    if (/m|p/.test(player.prof)) return [];

    const skills = Object.keys(player.skills).filter(
      (skill) => !ActionsHelper.hasSkillOrder(player, game, skill),
    );

    return skills.map(ActionsHelper.formatAction).filter((action) => !!action);
  }

  static formatAction(action: string) {
    if (ActionService.isAction(action)) {
      return ActionService.toObject(action);
    }
  }

  static buildActions(player: Player, game: GameService) {
    const basicActions = this.getBasicActions(player, game);
    const availableMagics = this.getAvailableMagics(player, game);
    const availableSkills = this.getAvailableSkills(player, game);

    return [...basicActions, ...availableMagics, ...availableSkills];
  }
}

export default ActionsHelper;
