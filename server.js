/* eslint-disable no-unused-vars */
'use strict';

// dependencies

require('dotenv').config();

const express = require('express');

const cors = require('cors');

const pg = require('pg');

const superagent = require('superagent');

const PORT = process.env.PORT || 4000;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
app.use(cors());

app.use(express.json());

app.use(express.static('./public'));

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
const ts =  process.env.TS;
const pubKey = process.env.MARVEL_API_KEY;
const hash = process.env.HASH;

// Render index
app.get('/main', (req, res) => {
  res.render('index');
});

app.get('/',(req,res)=>{
  let url =`http://gateway.marvel.com/v1/public/characters?&limit=100&ts=${ts}&apikey=${pubKey}&hash=${hash}`;
  superagent(url).then( results =>{
    const apiData = results.body.data.results;
    res.render('home' , {favChar:apiData});
    let a7a = apiData.map(data=>{
      let homeChar = new CharecthersOfHomePage(data);
      let SQL = 'INSERT INTO home (char_name,thumbnail,rating) VALUES ($1,$2,$3);';
      const safeValues = [homeChar.name,homeChar.thumbnail,0];
      client.query(SQL,safeValues);
    });

  });
});




function CharecthersOfHomePage(data){
  this.name = data.name;
  this.thumbnail = (data.thumbnail)?`${data.thumbnail.path}/portrait_xlarge.jpg`:'no image';
  this.rating = 0;
}

////////////////////////////////////////// HERE IS THE END OF HOME PAGE CODE ///////////////////////

app.get('/redirect', (req, res) => {
  let SQL = 'SELECT * FROM marvel ';
  client.query(SQL)
    .then(data => {
      res.render('index', { marvels: data.rows });
    });

});

app.get('/search', (req, res) => {
  let SQL = 'SELECT * FROM marvel ';
  client.query(SQL)
    .then(data => {
      res.render('index', { marvels: data.rows });
      // res.render('pages/indexshow');
    });
});


// app.get('/searches', makeRequest);

//ERROR

app.get('/error', (request, response) => {
  response.render('pages/error');
});

//SEARCHES

// app.get('/searches', (req, res) => {
//   res.render('pages/index');
// });
app.post('/searches', (req, res) => {

  // console.log("here");
  // consol.log(req);
  let url ='http://gateway.marvel.com/v1/public/characters?name='+req.body.search+'&ts='+ts+'&apikey='+pubKey+'&hash='+hash;
  console.log(url);
  superagent.get(url)
    .then(data => {

      // console.log(data);
      let character = data.body.data.results[0];

      let url2 ='http://gateway.marvel.com/v1/public/comics?characters='+character.id+'&ts='+ts+'&apikey='+pubKey+'&hash='+hash;

      superagent.get(url2)
        .then(data => {

          let comics = data.body.data.results;
          console.log(comics);


          res.render('pages/searches/show', { character: character, comics:comics});
        })
        .catch(error => {

          res.render('error');
        });

      // res.render('pages/searches/show', { character: character});
    })
    .catch(error => {

      res.render('error');
    });
});


// Add Marvel To DataBase
app.post('/addmarvel', (req,res) =>
{
  let { name, image, desc} = req.body;

  let SQL = 'INSERT INTO marvel (name, image, description) VALUES ($1, $2, $3)';
  let values = [name, image, desc];

  client.query(SQL, values)
    .then(() => {
      res.redirect('/redirect');
    }).catch(function(err) {
      console.log(print, err);
    });

});
// delete marvel from Data
app.post('/delete', (req,res) =>
{
  let {id} = req.body;

  let SQL = 'DELETE FROM marvel WHERE id=$1;';
  let values = [id];
  console.log(SQL);
  console.log(values);

  client.query(SQL, values)
    .then(() => {
      res.redirect('/redirect');
    }).catch(function(err) {
      console.log(print, err);
    });
});
/////////////////////////////////finish search and add delete function

app.get('*', function(req, res){
  res.render('error');
});

client.on('error',err => console.error(err));
client
  .connect()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`my server is up and running on port ${PORT}`)
    );
  })
  .catch((err) => {
    throw new Error(`startup error ${err}`);
  });
