import { itemSchema } from '@fwo/schemas';
import { itemSetSchema } from '@fwo/schemas';
import csv from 'csvtojson';
import { parse, array } from 'valibot';

export const generateItems = async () => {
  const rawItems = await csv({
    checkType: true,
    ignoreEmpty: true,
    colParser: {
      class: (value) => value.split(', '),
    },
  }).fromFile('./items.csv');

  const items = parse(array(itemSchema), rawItems);

  return items;
};

export const generateItemsSets = async () => {
  const rawItemsSets = await csv({
    checkType: true,
    ignoreEmpty: true,
    colParser: {
      items: (value) => value.split(', '),
    },
  }).fromFile('./items-sets.csv');

  const mergeModifiers = (acc, curr) => {
    const prev = acc.at(-1);
    if (prev?.code === curr.code) {
      prev.modifiers ??= [];
      if (curr.modifiers) {
        prev.modifiers.push(curr.modifiers);
      }
      return acc;
    }

    curr.modifiers = [];
    acc.push(curr);
    return acc;
  };

  const mergedItemsSets = rawItemsSets.reduce(mergeModifiers, []);

  const itemsSets = parse(array(itemSetSchema), mergedItemsSets);

  return itemsSets;
};
