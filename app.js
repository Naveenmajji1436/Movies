const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
app = express();
app.use(express.json());

let db = null;

const installServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log(`Server started...`);
    });
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`);
    process.exit(1);
  }
};

installServer();

const converting = (movieDB) => {
  return {
    movieId: movieDB.movie_id,
    directorId: movieDB.director_id,
    movieName: movieDB.movie_name,
    leadActor: movieDB.lead_actor,
  };
};

const convertingDirector = (eachDirector) => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  };
};

/// GET Movies List
app.get("/movies/", async (request, response) => {
  const SqlGetQuery = `
    SELECT movie_name as movieName
    FROM movie;`;
  let moviesList = await db.all(SqlGetQuery);
  response.send(moviesList);
});

/// POST Movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const SqlPostQuery = `
    INSERT INTO movie
    (director_id,movie_name,lead_actor)
    VALUES (${directorId},"${movieName}","${leadActor}");`;

  let movieDetailsAdding = await db.run(SqlPostQuery);
  let movieId = movieDetailsAdding.lastID;
  response.send(`Movie Successfully Added`);
});

/// GET MOVIE ID
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const SqlMovieIdQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};`;
  let movieDetails = await db.get(SqlMovieIdQuery);
  response.send(converting(movieDetails));
});

/// PUT MOVIE DETAILS
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateDetails = request.body;
  const { directorId, movieName, leadActor } = updateDetails;
  const SqlPutQuery = `
    UPDATE movie
    SET
    director_id = ${directorId},
    movie_name = "${movieName}",
    lead_actor = "${leadActor}"
    WHERE movie_id = ${movieId};`;
  await db.run(SqlPutQuery);
  response.send("Movie Details Updated");
});

/// DELETE MOVIE
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const SqlDeleteQuery = `
      DELETE FROM movie
      WHERE movie_id = ${movieId};`;
  await db.run(SqlDeleteQuery);
  response.send(`Movie Removed`);
});

/// GET DIRECTORS LIST
app.get("/directors/", async (request, response) => {
  const SqlDirectorsGetQuery = `
    SELECT *
    FROM director;`;
  let directorsList = await db.all(SqlDirectorsGetQuery);
  response.send(
    directorsList.map((eachDirector) => convertingDirector(eachDirector))
  );
});

/// GET DIRECTORS MOVIES LIST
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const SqlDirectorsMoviesList = `
    SELECT movie_name as movieName
    FROM director INNER JOIN movie
    ON movie.director_id = director.director_id
    WHERE director.director_id = ${directorId};`;
  let DirectorsMoviesList = await db.all(SqlDirectorsMoviesList);
  response.send(DirectorsMoviesList);
});

module.exports = app;
