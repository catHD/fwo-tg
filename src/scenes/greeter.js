const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const loginHelper = require('../helpers/loginHelper');

const { leave } = Stage;
const greeter = new Scene('greeter');

greeter.enter(async ({
  update, reply, scene, session,
}) => {
  const resp = await loginHelper.check(update.message.from.id);
  if (resp) {
    // eslint-disable-next-line no-param-reassign
    session.character = await loginHelper.getChar(update.message.from.id);
    reply('Привет');
    leave();
    scene.enter('lobby');
  } else {
    // eslint-disable-next-line no-param-reassign
    session.character = {};
    leave();
    scene.enter('create');
  }
});

module.exports = greeter;
