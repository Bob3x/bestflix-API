const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();
app.use(express.json());
app.use(express.urlencoded ({ extended: true }));
let auth = require('./auth.js')(app); 
app.use(morgan('combined'));        // Morgan middleware to log all requests to the terminal
app.use(express.static('public'));  // Serve static files from the "public" directory


const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

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
app.get('/movies/:Title', async (req, res) => {
	await Movies.findOne({ Title: req.params.Title })
  .then ((movie) => {
    res.json(movie)
  })
  .catch((err) => {
    console.error(err);
    res.status(400).send('Movie not found.' + err);
  });
});

// GET movie by director's name
app.get('/movies/Director/:Name', async (req, res) => {
	await Movies.findOne({ 'Director.Name': req.params.Name }) 
  .then ((movie) => {
    res.json(movie.Director)
  })
  .catch((err) => {
    console.error(err);
    res.status(400).send('Director not found.' + err);
  });
});

// GET movie by genre
app.get('/movies/Genre/:Name', async (req, res) => {
	await Movies.findOne({ 'Genre.Name': req.params.Name })
  .then ((Genre) => {
    res.json(Genre)
  })
  .catch ((err) => {
    console.error(err);
    res.status(400).send('Genre not found.' + err);
  });
});

// GET all users
app.get('/users', async (req, res) => {
  await Users.find()
  .then ((users) => {
    res.status(200).json(users);
  })
  .catch((err) => {
  console.error(err);
  res.status(500).send('Error: ' + err);
  });
});

// CREATE new user in myFlixDB - MongoDB
app.post('/users', async (req, res) => {
  await Users.findOne({ 'Username': req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
        // If the user already exists 
      } else {
        Users
        // If not - create new user
          .create({                                                        
            Username: req.body.Username,
            Password: req.body.Passowrd,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {res.status(201).json(user)})
          .catch((error) => {
            console.error(error);
            res.status(500).send('Unable to create user - data is required!' + error);
          })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send('Bad request.' + error);
    });
});

// UPDATE user's info by username
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ 'Username': req.params.Username }, {
    $set:
    {
      Username: req.body.Username,
      Email: req.body.Email,
      Password: req.body.Password,
      Birthday: req.body.Birthday
    }
  },
  // Updated document is returned
  {new: true})       
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((error) => {
    console.error(error);
    res.status(400).send('User not found.' + error);
  });
});

// DELETE user by username
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndRemove({'Username': req.params.Username})
  .then((user) => {
    if(!user) {
      res.status(400).send(req.params.Username + 'was not found.');
    } else {
      res.status(200).send(req.params.Username + 'has been deleted.');
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('No such user.' + error);
  });
});

// UPDATE users favorite movies
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
await Users.findOneAndUpdate({ 'Username': req.params.Username}, {
  $push: { FavoriteMovies: req.params.MovieID }
},
{new: true})
.then((updatedUser) => {
  res.json(updatedUser)
})
.catch((error) => {
  console.error(error);
  res.status(500).send('No such movie' + error);
  }); 
});

// DELETE favorite movie
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
await Users.findOneAndUpdate({Username: req.params.Username}, {
  $pull: { favoriteMovies: req.params.MovieID }
},
{new: true})
.then((updatedUser) => {
  res.json(updatedUser)
})
.catch((error) => {
  console.error(error);
  res.status(500).send('Movie not found' + error);
  }); 
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});