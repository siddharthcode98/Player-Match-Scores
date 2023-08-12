const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDBAndServer();

//API 1 Returns a list of all the players in the player table
app.get("/players/", async (request, response) => {
  const getPlayersList = `SELECT player_id AS playerId,player_name AS playerName FROM player_details;`;
  const playersList = await db.all(getPlayersList);
  response.send(playersList);
});

//API 2 Returns a specific player based on the player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSpecificPlayer = `
    SELECT
    player_id AS playerId,
    player_name AS playerName
    FROM 
    player_details
    WHERE
    player_id=${playerId};`;

  const specificPlayer = await db.get(getSpecificPlayer);
  response.send(specificPlayer);
});

//API 3 Updates the details of a specific player based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const newPlayerValues = request.body;
  const { playerName } = newPlayerValues;
  const updatePlayerQuery = `
    UPDATE player_details
    SET
    player_name='${playerName}'
    WHERE
    player_id=${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// API 4 Returns the match details of a specific match

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT
    match_id AS matchId,
    match AS match,
    year AS year
    FROM
    match_details
    WHERE
    match_id=${matchId};`;
  const match = await db.get(getMatchQuery);
  response.send(match);
});

//API 5 Returns a list of all the matches of a player
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const listOfMatchesQuery = `
    SELECT
        player_match_score.match_id AS matchId,
        match,
        year
    FROM
    match_details
    INNER JOIN player_match_score ON player_match_score.match_id = match_details.match_id
    WHERE
    player_id=${playerId};`;
  const matchDetails = await db.all(listOfMatchesQuery);
  console.log(matchDetails);
  response.send(matchDetails);
});

//API 6 Returns a list of players of a specific match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getAListOfPlayers = `SELECT 
  player_details.player_id AS playerId,
  player_details.player_name AS playerName 
  FROM 
  player_details
  INNER JOIN player_match_score ON 
  player_match_score.player_id=player_details.player_id
  WHERE
  match_id=${matchId};`;
  const getListOfPlayer = await db.all(getAListOfPlayers);
  response.send(getListOfPlayer);
});
//API 7 Returns the statistics of the total score, fours, sixes of a specific player based on the player ID
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const statsOfPlayersQuery = `SELECT 
  player_details.player_id AS playerId,
  player_details.player_name AS playerName, 
  SUM(score) AS totalScore,
  SUM(fours) AS totalFours,
  SUM(sixes) AS totalSixes
  FROM 
  player_details
  INNER JOIN player_match_score ON 
  player_match_score.player_id=player_details.player_id
  WHERE
  player_details.player_id=${playerId};`;

  const statsOfPlayer = await db.get(statsOfPlayersQuery);
  response.send(statsOfPlayer);
});

module.exports = app;
