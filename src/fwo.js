const Telegraf = require('telegraf');
const session = require('telegraf/session');
const db = require('./models');
const stage = require('./scenes/stage.js');

// DB connection

// eslint-disable-next-line no-console
db.connection.on('open', () => console.log('db online'));
// const bot = new Telegraf(process.env.BOT_TOKEN);
const bot = new Telegraf('870195325:AAFplj6OBq-Y8Dog68bqlZeTyeUNK2VMO-M');

bot.use(session());
bot.use(stage.middleware());
bot.start(({ scene }) => scene.enter('greeter'));
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'));
bot.command('create', (ctx) => ctx.scene.enter('create'));
bot.command('select', (ctx) => ctx.scene.enter('select'));
bot.command('lobby', (ctx) => ctx.scene.enter('lobby'));
bot.launch();
