const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let dbpath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDB = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error ${e.message}`);
  }
};

initializeDB();

function movieContextToObject(obj) {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
}

function movie_nameToMovieName(eachObj) {
  return {
    movieName: eachObj.movie_name,
  };
}

const contextToDirectorObj = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

//get All Movie Names
app.get("/movies/", async (request, response) => {
  let getMoviesQuery = `select movie_name from movie;`;
  let getResponse = await db.all(getMoviesQuery);
  response.send(
    getResponse.map((eachMovie) => movie_nameToMovieName(eachMovie))
  );
});

//POST a new Movie in the Database

app.post("/movies/", async (request, response) => {
  let { directorId, movieName, leadActor } = request.body;
  let postMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor) 
  VALUES ('${directorId}', '${movieName}', '${leadActor}'); `;
  let postResponse = await db.run(postMovieQuery);
  let movieId = postResponse.lastId;
  console.log(movieId);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let getOneMovie = `select * from movie where movie_id = ${movieId};`;
  let putMovieResponse = await db.get(getOneMovie);
  response.send(movieContextToObject(putMovieResponse));
});

app.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let { directorId, movieName, leadActor } = request.body;
  let putMovieQuery = `UPDATE MOVIE 
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(putMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  let getDirectors = `SELECT * FROM director;`;
  directorResponse = await db.all(getDirectors);
  response.send(
    directorResponse.map((eachDirector) => contextToDirectorObj(eachDirector))
  );
});

app.get("/directors/:directorId/movies", async (request, response) => {
  let { directorId } = request.params;
  let moviesQuery = `select movie_name from movie where director_id = ${directorId};`;
  let movieResponse = await db.all(moviesQuery);
  response.send(
    movieResponse.map((eachMovie) => movie_nameToMovieName(eachMovie))
  );
});
module.exports = app;
