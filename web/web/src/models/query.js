module.exports = {
  'countAdmin': 'SELECT COUNT(id) FROM public.teams WHERE admin=true;',
  'insertTeam': `INSERT INTO teams(name, members, bot, admin, password)
 VALUES ($1, $2, false, $3, $4) RETURNING id, admin;`,
  'selectTeam': 'SELECT * FROM teams WHERE name=$1',
  'selectTeams': 'SELECT * FROM teams WHERE admin=false',
  'selectCleanTeams': 'SELECT id, name, bot FROM teams WHERE admin=false AND bot=false',
  'insertGame': `INSERT INTO games(
    round, ranked, status, next_team_count, max_players, team0, team1
  )
 VALUES ((SELECT round FROM configs WHERE id=0), $1, $2, $3, $4, $5, $6);`,
  'selectBots': 'SELECT * FROM teams WHERE bot=true;',

  'selectJoinableGames':
`SELECT games.*,
 t0.name AS t0Name,
 t1.name AS t1Name
 FROM games
LEFT JOIN teams AS t0 ON t0.id = games.team0
LEFT JOIN teams AS t1 ON t1.id = games.team1
WHERE status='created'
 AND ranked = false
 AND next_team_count < max_players
 AND (team0 IS null OR team0<>$1)
 AND (team1 IS null OR team1<>$1);`,

  'getNextTeamIDForGame': `
UPDATE games
SET next_team_count = next_team_count + 1
WHERE id=$1
RETURNING next_team_count, max_players`,
  // I know, this should be nicer
  'joinGameAsTeam0': 'UPDATE games SET team0=$1 WHERE id=$2',
  'joinGameAsTeam1': 'UPDATE games SET team1=$1 WHERE id=$2',
  'selectRelatedGames':
`SELECT games.*,
 t0.name AS t0Name,
 t1.name AS t1Name,
 g0.name AS g0Name,
 g1.name AS g1Name
 FROM games
LEFT JOIN teams AS t0 ON t0.id = games.team0
LEFT JOIN teams AS t1 ON t1.id = games.team1
LEFT JOIN teams AS g0 ON g0.id = games.grade0
LEFT JOIN teams AS g1 ON g1.id = games.grade1
WHERE (team0 IS NOT null AND team0=$1)
 OR (team1 IS NOT null AND team1=$1);`,
  'getConfigs': 'SELECT * FROM configs WHERE id=0;',
  'updateRound': 'UPDATE configs SET round=$1 WHERE id=0;',
  'updateSubmitionsOver': 'UPDATE configs SET submitions_over=$1 WHERE id=0;',

  'selectRankeds': `SELECT games.*,
 t0.name AS t0Name,
 t1.name AS t1Name,
 g0.name AS g0Name,
 g1.name AS g1Name
 FROM games
LEFT JOIN teams AS t0 ON t0.id = games.team0
LEFT JOIN teams AS t1 ON t1.id = games.team1
LEFT JOIN teams AS g0 ON g0.id = games.grade0
LEFT JOIN teams AS g1 ON g1.id = games.grade1
WHERE ranked=true`,

  'selectStats': "SELECT * FROM games WHERE ranked=true AND status='played'",
  'readyGame': "UPDATE games SET status='ready' WHERE id=$1",
  'getRound': 'SELECT round FROM configs WHERE id=0;',
  'teamName': 'SELECT name FROM teams WHERE id=$1',
}
