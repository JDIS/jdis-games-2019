'use strict';

const fs = require('fs');
const yauzl = require('yauzl');
const Router = require('koa-router');


const { isAuth, isNotOver } = require('../middlewares/auth.js');
const Team = require('../models/team.js');
const Game = require('../models/game.js');
const moment = require('moment-timezone');

const router = module.exports = new Router();

async function resolveTimestamp(userId) {
  return await Promise.race([
    new Promise((resolve, reject) => {
      let path = `./bots/${userId}.zip`
      if (!fs.existsSync(path)) {
        return reject("Path doesn't exist");
      } 
      yauzl.open(path, (err, zipfile) => {
        if (err) {
          return reject(err);
        }
        zipfile.on("entry", (entry) => {
          if (~entry.fileName.indexOf("MyBot.py")) {
            resolve(entry.getLastModDate().toISOString().slice(0,-5).replace("T", " "))
          }
        });
      });
  }), new Promise((_, reject) => {
    setTimeout(reject.bind(this, "Function timed-out"), 500);
  })]);
}

router.get('/', isAuth, isNotOver, async function (ctx) {
  ctx.state.id = ctx.session.id;
  ctx.state.bots = await Team.selectBots(ctx.state.db);
  ctx.state.joinableGames =
    await Game.selectJoinableGames(ctx.state.db, ctx.session);

  ctx.state.relatedGames =
    await Game.selectRelatedGames(ctx.state.db, ctx.session);

  // sort games by date (newest first)
  ctx.state.joinableGames.sort(sortGamesOldestFirst);
  ctx.state.relatedGames.sort(sortGamesNewestFirst);

  // format data for the view
  ctx.state.joinableGames.forEach(formatGameData);
  ctx.state.relatedGames.forEach(formatGameData);

  // last bot upload time
  try {
    ctx.state.last_upload = await resolveTimestamp(ctx.session.id);
  }
  catch (e) {
    console.error("Unexpected error while parsing zip file:", e);
  }

  await ctx.render('dashboard');
});

function formatGameData (game) {
  if (game.replay) {
    game.replay = encodeURIComponent(`/public/games/${game.replay}`);
  }
  moment.locale('fr-CA');
  game.created = moment(game.created).tz('America/New_York').format('HH:mm');

  switch (game.status) {
    case 'played':
      game.status = 'Partie complétée"'
      break;
    case 'created':
      game.status = 'Partie en attente"'
      break;
    default:
      break;
  }
}

function sortGamesOldestFirst (gameA, gameB) {
  return gameA.created - gameB.created;
}

function sortGamesNewestFirst (gameA, gameB) {
  return gameB.created - gameA.created;
}
