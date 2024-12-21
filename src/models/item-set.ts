import arena from '@/arena';
import { generateItemsSets } from '@/helpers/itemHelper';
import type { Item } from '@fwo/schemas';
import type { ItemSet } from '@fwo/schemas';
import _ from 'lodash';
import type { Model } from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';

export type ItemSetModel = Model<ItemSet> & typeof ItemSetDocument;

export class ItemSetDocument extends Document<Item> {
  static async load(this: ItemSetModel) {
    const timer = Date.now();

    try {
      const items = await this.find({});
      if (items.length) {
        arena.itemsSets = _.keyBy(items, ({ code }) => code);
      } else {
        const itemsSets = await generateItemsSets();

        const createdItems = await ItemSetModel.create(itemsSets);
        arena.itemsSets = _.keyBy(createdItems, ({ code }) => code);
      }
    } catch (e) {
      console.error(e);
    } finally {
      console.log('Items loaded.T:', Date.now() - timer, 'ms');
    }
  }
}

/**
 * Item
 *
 * @description Модель комплекта
 * @module Model/ItemSet
 */

const itemSet = new Schema<ItemSet, ItemSetModel>(
  {
    code: {
      type: String,
      unique: true,
      required: true,
    },
    info: { type: Object },
    attributes: { type: Object },
    base: { type: Object },
    phys: { type: Object },
    magic: { type: Object },
    heal: { type: Object },
    hit: { type: Object },
    modifiers: [{ type: Object }],
  },
  {
    versionKey: false,
  },
);

itemSet.loadClass(ItemSetDocument);

export const ItemSetModel = mongoose.model<ItemSet, ItemSetModel>('ItemSet', itemSet);
