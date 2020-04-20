/* eslint-disable no-unused-vars */
'use strict';

// dependencies

require('dotenv').config();

const express = require('express');

const cors = require('cors');

const superagent = require('superagent');

const PORT = process.env.PORT || 4000;
const pg = require('pg');
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

// const privKey = process.env.MARVEL_PRIVATE_KEY
// const hash = md5(ts + privKey + pubKey)

//Test Route
app.get('/test', (req, res) => {
  res.status(200).send('Hello ');
});

//Render index
app.get('/main', (req, res) => {
  res.render('index');
});



// http://gateway.marvel.com/v1/public/comics?ts=1&apikey=1234&hash=ffd275c5130566a2916217b101f26150
app.get('/', (req, res) => {
  let url =`http://gateway.marvel.com/v1/public/characters?&limit=100&ts=${ts}&apikey=${pubKey}&hash=${hash}`;

  superagent(url)
    .then( results =>{

      const apiData = results.body.data.results;
      // console.log(results);
      // console.log(results.body.data.results);
      res.render('home' , {favChar:apiData});
      let a7a = apiData.map(data=>{

        let homeChar = new CharecthersOfHomePage(data);

        let SQL = 'INSERT INTO home (char_name,thumbnail,rating) VALUES ($1,$2,$3);';

        // const safeValues = [apiData.name,apiData.thumbnail.path,0];
        const safeValues = [homeChar.name,homeChar.thumbnail,0];
        // console.log(homeChar);
        client.query(SQL,safeValues);

      });

    });
  // .catch( error => {
  //    console.log(url);

  //   res.render('error');
});


// });


function CharecthersOfHomePage(data){
  this.name = data.name;
  this.thumbnail = (data.thumbnail)?`${data.thumbnail.path}/portrait_xlarge.jpg`:'no image';
  this.rating = 0;
}

////////////////////////////////////////// HERE IS THE END OF HOME PAGE CODE ///////////////////////


app.get('/search', (req, res) => {
  res.render('index');
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

app.get('*', function(req, res){
  res.render('error');
});

client.connect().then( ()=>{

  app.listen(PORT, () => console.log('listening from port', PORT));
});
