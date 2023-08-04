const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const filePath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());
let db = null;
const initialization = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, (request, response) => {
      console.log("server running at localhost://3000");
    });
  } catch (e) {
    console.log(`server error ${e.message}`);
    process.exit(1);
  }
};

initialization();

//get method
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
app.get("/movies/", async (request, response) => {
  const getMoviesData = `
    select movie_name from movie;`;
  const getMoviesData1 = await db.all(getMoviesData);
  response.send(
    getMoviesData1.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//post method
app.post("/movies/", async (request, response) => {
  const newmovieBody = request.body;
  const { directorId, movieName, leadActor } = newmovieBody;
  const addNewMovie = `
    insert into movie(director_id,
movie_name,
lead_actor)
values('${directorId}','${movieName}','${leadActor}');`;
  await db.run(addNewMovie);
  response.send("Movie Successfully Added");
});

//get movie details

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = `
select * from movie
where movie_id='${movieId}';`;
  const movieDetailsop = await db.get(movieDetails);
  response.send(movieDetailsop);
});

//put method
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const data1 = request.body;
  const { directorId, movieName, leadActor } = data1;
  const updateQuery = `update
  movie set

director_id='${directorId}',
movie_name='${movieName}',
lead_actor='${leadActor}'
where movie_id='${movieId}';`;
  await db.run(updateQuery);
  //response.send(movieId);
  response.send("Movie Details Updated");
});
//delete method

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletedQuery = `delete
    from movie
    where movie_id='${movieId}';`;
  await db.run(deletedQuery);
  response.send("Movie Removed");
});

//director get method

const directordata = (dd) => {
  return {
    directorId: dd.director_id,
    directorName: dd.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectorData = `select * from director;`;
  const getDirector = await db.all(getDirectorData);
  //response.send(getdata);
  response.send(getDirector.map((eachPlayer) => directordata(eachPlayer)));
});

//specific movie name

app.get("/directors/:directorId/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovieQuery = `
 select
 movie.movie_name 
 from director inner join movie
 on director.director_id=movie.director_id
 where director.director_id='${directorId}'
 ;`;
  const op = await db.all(directorMovieQuery);
  response.send(op);
});
module.exports = app;
