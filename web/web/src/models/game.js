'use strict';

const query = require('./query.js');

async function createGame (db, session, request) {
  console.log(session);
  if (request.value === 'players') {
    await db.none(query.insertGame, [
      false,
      'created',
      1,
      2, // TODO : make max_players dynamic
      session.id,
      null,
    ]);
  } else {
    await db.none(query.insertGame, [
      false,
      'ready',
      2,
      2, // TODO : make max_players dynamic
      session.id,
      '1',
    ]);
  }
}
module.exports.createGame = createGame;

module.exports.createRanked = async (db, session, request) => {
  if (request.teams.length !== 2) {
    throw new Error('Should submit with 2 teams');
  }
  await db.none(query.insertGame, [
    true,
    'ready',
    2,
    2,
    request.teams[0],
    request.teams[1],
  ]);
}

async function selectJoinableGames (db, session) {
  return db.any(query.selectJoinableGames, [session.id]);
}
module.exports.selectJoinableGames = selectJoinableGames;

async function selectRelatedGames (db, { id }) {
  return db.any(query.selectRelatedGames, [id]);
}
module.exports.selectRelatedGames = selectRelatedGames;

async function joinGame (db, { id: teamId }, request) {
  if (request.join == null) {
    throw new Error('Wrong game id');
  }

  const result = (await db.one(query.getNextTeamIDForGame, [request.join]))
  const nextId = result.next_team_count - 1;
  const maxPlayers = result.max_players;
  if (!Number.isInteger(nextId) || nextId >= maxPlayers || nextId < 0) {
    throw new Error('Tried to join a full game');
  }

  // This should (but never will) be refactored to an another table
  if (nextId === 0) {
    return db.none(query.joinGameAsTeam0, [teamId, request.join]);
  } else if (nextId === 1) {
    await db.none(query.joinGameAsTeam1, [teamId, request.join]);
    return db.none(query.readyGame, [request.join]);
  }
}
module.exports.joinGame = joinGame;

module.exports.selectRankeds = async db => {
  return db.any(query.selectRankeds);
}

module.exports.selectStats = async db => {
  return {
    games: await db.any(query.selectStats),
    teams: await db.any(query.selectCleanTeams),
    round: (await db.one(query.getRound)).round,
  }
}
