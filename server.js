/* eslint-disable no-unused-vars */
'use strict';

// dependencies

require('dotenv').config();

const express = require('express');

const cors = require('cors');

const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const ts = process.env.TS;
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
app.get('/', (req, res) => {
    res.render('index');
});

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
    let url = 'http://gateway.marvel.com/v1/public/characters?name=' + req.body.search + '&ts=' + ts + '&apikey=' + pubKey + '&hash=' + hash;
    console.log(url);
    superagent.get(url)
        .then(data => {

            // console.log(data);
            let character = data.body.data.results[0];

            let url2 = 'http://gateway.marvel.com/v1/public/comics?characters=' + character.id + '&ts=' + ts + '&apikey=' + pubKey + '&hash=' + hash;

            superagent.get(url2)
                .then(data => {

                    let comics = data.body.data.results;
                    console.log(comics);


                    res.render('pages/searches/show', { character: character, comics: comics });
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

/////////////////////////////////////Movies page code starts here////////////////////////////////////////////////////////////////////////////////

app.get('/moviespage', moviesPageHandler)

function moviesPageHandler(req, res) {
    res.render('pages/searches/movie-show');
}

app.post('/movies', moviesHandler);

function moviesHandler(req, res) {
    superagent(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${req.body.input}`)
        .then((moviesRes) => {
            if (moviesRes.body.results.length > 0) {
                // console.log(moviesRes.body.results);
                const moviesInfo = moviesRes.body.results.map((element) => {
                    return new Movie(element)
                });
                // let filtered = moviesInfo.filter(value => {
                //     return value.overview.includes(`super`)
                // });
                // console.log(filtered);
                res.render('movies-index', { movies: moviesInfo })
            } else {
                res.render('notFound')
            }
        })

    .catch((err) => {
        res.render('error');
    })

}

function Movie(element) {
    this.title = (true && element.original_title) || 'TITLE NOT FOUND';
    this.overview = (true && element.overview) || 'DESCRIPTION NOT FOUND';
    this.image_url = `${element.poster_path}` ? `https://image.tmdb.org/t/p/w500/${element.poster_path}` : `https://www.creativeway.cloud/wp-content/uploads/2018/09/240_F_139166369_NdTDXc0lM57N66868lC66PpsaMkFSwaf.jpg`;
    this.released_on = (true && element.release_date) || 'No realesed date available';
    this.popularity = (true && element.popularity) || 'N/A';
}



/////////////////////////////////////Movies page code ends here////////////////////////////////////////////////////////////////////////////////





app.get('*', function(req, res) {
    res.render('error');
});

app.listen(PORT, () => console.log('listening from port', PORT));