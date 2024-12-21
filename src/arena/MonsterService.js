/**
 * Monster Service
 * @description Класс для создание монстра
 * @module Service/Monster
 * @todo Это нерабочий модуль, только прототип
 */

export const Monster = (data) => {
  this.name = data?.name ? data.name : this.generateName();
  this.class = data?.class ? data.class : this.generateClass();
};

Monster.prototype = {
  name: undefined,
  class: undefined,
  xp: 25,
  level: 1,
  baseStats: {
    strength: 10,
    intelligence: 10,
    dexterity: 10,
    life: 100,
    mana: 100,
  },
  currentLife: null,
  currentMana: null,
  damage: 1,
  attackSpeed: 1,

  generateName() {
    const rng = Math.floor((Math.random() * 4));
    const names = [
      'Grumpy',
      'Ezekiel',
      'Foobar',
      'Baumkopf Holzfaust',
    ];

    return names[rng];
  },

  generateClass() {
    const rng = Math.floor((Math.random() * 5));
    const names = [
      'Wolf',
      'Bear',
      'Vampir',
      'Zombie',
      'Skeleton',
    ];

    return names[rng];
  },

  getMonsterData() {
    return {
      name: this.name,
      class: this.class,
      level: this.level,
      xp: this.xp,
      damage: this.getTotalDamage(),
      currentLife: this.getCurrentLife(),
      totalLife: this.getTotalLife(),
      currentMana: this.getCurrentMana(),
      totalMana: this.getTotalMana(),
    };
  },

  getTotalDamage() {
    return this.damage;
  },

  getCurrentLife() {
    return this.currentLife || this.baseStats.life;
  },

  getTotalLife() {
    return this.baseStats.life;
  },

  getCurrentMana() {
    return this.currentMana || this.baseStats.mana;
  },

  getTotalMana() {
    return this.baseStats.mana;
  },

  heal(value) {
    this.currentLife = this.currentLife + value > this.getTotalLife()
      ? this.currentLife + value : this.getTotalLife();
  },
};

module.exports = {
  Monster,
  generateNewMonster() {
    return new Monster();
  },
};
