const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(morgan('combined'));        // Morgan middleware to log all requests to the terminal
app.use(express.static('public'));  // Serve static files from the "public" directory


const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnfiedTopology: true });

// List  of users
let users = [
  {
    id: 1,
    name: "Bobb",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Sara",
    favoriteMovies: ["The Gotfather"]
  }
]

// List of movies
let topMovies = [
    {
      title: 'The Godfather',
      description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      imageURL: 'https://www.imdb.com/title/tt0068646/mediaviewer/rm746868224/?ref_=tt_ov_i',
      director: 'Francis Ford Coppola',
      genre: 'Crime',
      year: '1972'
    },
    {
      title: 'The Shawshank Redemption',
      description: 'A Maine banker convicted of the murder of his wife and her lover in 1947 gradually forms a friendship over a quarter century with a hardened convict, while maintaining his innocence and trying to remain hopeful through simple compassion.',
      imageURL: 'https://www.imdb.com/title/tt0111161/mediaviewer/rm1690056449/?ref_=tt_ov_i',
      director: 'Frank Darabont',
      genre: 'Drama',
      year: '1994'
    },
    {
      title: 'Schindler`s List',
      description: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.',
      imageURL: 'https://www.imdb.com/title/tt0108052/mediaviewer/rm1610023168/?ref_=tt_ov_i',
      director: 'Steven Spielberg',
      genre: 'Drama',
      year: '1993'
    },
    {
      title: 'Raging Bull',
      description: 'The life of boxer Jake LaMotta, whose violence and temper that led him to the top in the ring destroyed his life outside of it.',
      imageURL: 'https://www.imdb.com/title/tt0081398/mediaviewer/rm3879544320/?ref_=tt_ov_i',
      director: 'Martin Scorsese',
      genre: 'Drama',
      year: '1980'
    },
    {
      title: 'Citizen Kane',
      description: 'Following the death of publishing tycoon Charles Foster Kane, reporters scramble to uncover the meaning of his final utterance: "Rosebud".',
      imageURL: 'https://www.imdb.com/title/tt0068646/mediaviewer/rm746868224/?ref_=tt_ov_i',
      director: 'Orson Welles',
      genre: 'Drama',
      year: '1941'
    },
];

// GET request welcome url
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

// GET documentation file
app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

// GET all movies from the database to the user
app.get('/movies', async (req, res) => {
  await Movies.find()
  .then ((movies) => {
    res.status(200).json(movies);
  })
  .catch((err) => {
  console.error(err);
  res.status(500).send('Error: ' + err);
  });
});

// GET movie by title
app.get('/movies/:title', (req, res) => {
	const { title } = req.params;  // Get the title from the request parameters
	const movie = topMovies.find(movie => movie.title === title);  // Loop through the array and find the movie title

	if (movie) {
	  res.status(200).json(movie);
	} else {
    return res.status(400).send('Movie not found.');
  }
});

// GET movie by director
app.get('/movies/title/:directorName', (req, res) => {
	const { directorName } = req.params;   // Get the director from the request parameters
  const director = topMovies.find((m) => m.director === directorName);  // Loop through the array and find the director

	if (!director) {
		return res.status(400).send('Director not found.');
	}
  res.json(director);
});

// GET movie by genre
app.get('/movies/genres/:genreName', (req, res) => {
	const { genreName } = req.params;  	// Get the genre from the request parameters
	const genre = topMovies.find((m) => m.genre === genreName);  	// Loop through the array and find the matching genre
	
  if (!genre) {
		return res.status(400).send('Genre not found.');
	}
	res.json(genre);
});

// GET movie by year
app.get('/movies/years/:yearMovie', (req, res) => {
	// Get the title from the request parameters
	const { yearMovie } = req.params;
	const year = topMovies.find((m) => m.year === yearMovie);   	// Loop through the array and find the matching year
	
  if (!year) {
		return res.status(400).send('Year not found.');
	}
	res.json(year);
});

// Create new user in myFlixDB - MongoDB
app.post('/users', async (req, res) => {
  await Users.findOne({ Usernam: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists'); // If the user already exists
      } else {
        Users
          .create({                                                        // If not - create new user
            Username: req.body.Username,
            Password: req.body.Passowrd,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {res.status(201).json(user)})
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Update user
app.put('/users/:id', (req, res) => {
  const { id } = req.params; 
  const updatedUser = req.body;
  let user = users.find(user => user.id == id);
  
  if (user) { 
    user.name = updatedUser.name;
    res.status(200).json(user)
  }else {
    return res.status(400).send('User not found.'); 

  }
});

// DELETE user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params; 
  let user = users.find(user => user.id == id);
  
  if (user) { 
    users = users.filter( user => user.id != id );
    res.status(200).send(`User ${id} has been deleted.`);
  }else {
    return res.status(400).send('User not found.'); 
  }
});

// POST favorite movie
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params; 
  let user = users.find(user => user.id == id);
  
  if (user) { 
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array.`);
  }else {
    return res.status(400).send('Movie not found.'); 
  }
});

// DELETE favorite movie
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params; 
  let user = users.find(user => user.id == id);
  
  if (user) { 
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle )
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array.`);
  }else {
    return res.status(400).send('Movie not found.'); 
  }
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});