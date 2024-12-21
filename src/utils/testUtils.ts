import casual from 'casual';
import type { AnyKeys } from 'mongoose';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import { ClanService } from '@/arena/ClanService';
import type { HistoryItem } from '@/arena/HistoryService';
import { formatMessage } from '@/arena/LogService/utils';
import { profsList, profsData, type Prof } from '@/data/profs';
import { type Char, CharModel } from '@/models/character';
import { type Clan, ClanModel } from '@/models/clan';
import { InventoryModel } from '@/models/inventory';
import { ItemModel } from '@/models/item';
import type { Item } from '@fwo/schemas';

const functions = casual.functions();

export default class TestUtils {
  static async createCharacter(params?: Partial<Char>, {
    withWeapon = false,
  }: { withWeapon?: boolean | string } = {}) {
    const prof: Prof = params?.prof ?? casual.random_element([...profsList]);
    const char = await CharModel.create({
      owner: casual.integer(1_000_000, 9_999_999).toString(),
      nickname: functions.word(),
      sex: casual.random_element(['m', 'f']),
      prof,
      harks: profsData[prof].hark,
      magics: profsData[prof].mag,
      ...params,
    });

    if (withWeapon) {
      const weapon = await this.getWeapon(withWeapon);

      char.inventory = await InventoryModel.create([{
        wear: weapon.wear,
        code: weapon.code,
        owner: char.id,
        putOn: true,
      }]);

      await char.save();
    }

    await CharacterService.getCharacter(char.owner);
    return char;
  }

  static async getCharacter(id: string) {
    const charatcter = await CharModel.findById(id);
    return charatcter?.toObject();
  }

  static resetCharacterCache() {
    arena.characters = {};
  }

  static async createClan(charId: string, params?: AnyKeys<Clan>) {
    const players = params?.players?.concat([charId]) ?? [charId];
    const created = await ClanModel.create({
      owner: charId,
      name: functions.word(),
      ...params,
      players,
    });
    const clan = await created.save();
    await CharModel.updateMany({ _id: { $in: players } }, { clan: clan.id });
    return ClanService.getClanById(clan.id);
  }

  static async getClan(id: string) {
    const clan = await ClanModel.findById(id).populate('owner').populate('players').populate('requests');
    return clan?.toObject();
  }

  static async getClans() {
    const clans = await ClanModel.find();
    return clans.map((clan) => clan.toObject());
  }

  static async getWeapon(mayBeCode: true | string): Promise<Item> {
    const code = typeof mayBeCode === 'string' ? mayBeCode : 'epicSword';
    await ItemModel.load();
    return ItemModel.findOne({ code }).orFail();
  }

  static normalizeRoundHistory(history: HistoryItem[]) {
    return history.map((item) => {
      return formatMessage(item);
    }).join('\n');
  }
}
