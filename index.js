const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const passport = require('passport');
const { check, validationResult } = require('express-validator');

const cors = require('cors');
// Database
const mongoose = require('mongoose');
const Models = require('./models.js');

const app = express();

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect('process.env.CONNECTION_URI', { useNewUrlParser: true, useUnifiedTopology: true });

const username = encodeURIComponent('bob3x');
const password = encodeURIComponent('lEX6W7KWRvmEKiTL');
const uri = `mongodb+srv://${username}:${password}@my-db-cluster.2utmo.mongodb.net/myFlixDB?retryWrites=true&w=majority&appName=my-DB-cluster`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware configurations  
  app.use(express.json());
  app.use(express.urlencoded ({ extended: true }));
  app.use(morgan('combined'));        // Morgan middleware to log all requests to the terminal
  app.use(express.static('public'));  // Serve static files from the "public" directory
  
// CORS configuration
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:1234',
  'https://my-movies-flix-app-56f9661dc035.herokuapp.com/', 
  'https://my-movie-flix.netlify.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) 
      return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy: Origin not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  allowedHeaders:["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// Authentication
require('./passport.js');
let auth = require('./auth.js')(app); 


// require('dotenv').config();
// Check if JWT_SECRET is set
/*if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1); // Exit the application
}*/


// ROUTES
// GET request welcome url
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

// GET documentation file
app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

// GET all movies from the database to the user
app.get('/movies', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const movies = await Movies.find();
    res.status(200).json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// GET movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.Title });
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).send('Movie not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// GET movie by director's name
app.get('/movies/Director/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const movie = await Movies.findOne({ 'Director.Name': req.params.Name });
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).send('Director not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// GET movie by genre
app.get('/movies/Genre/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const movie = await Movies.findOne({ 'Genre.Name': req.params.Name });
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).send('Genre not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// GET all users
app.get('/users', async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// CREATE new user in myFlixDB - MongoDB
app.post('/users', [
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email is not valid').isEmail()
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const hashedPassword = Users.hashPassword(req.body.Password);
  try {
    const user = await Users.findOne({ Username: req.body.Username });
    if (user) {
      // If the user already exists 
      return res.status(400).send(req.body.Username + ' already exists');
    } 
      // create new user
      const newUser = await Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email
      });
    
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});

// UPDATE user's info by username
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), [
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
], async (req, res) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permision denied.');
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const hashedPassword = Users.hashPassword(req.body.Password);
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Email: req.body.Email,
          Password: hashedPassword,
          Birthday: req.body.Birthday
        }
      },
      { new: true } // Updated document is returned
    );
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// DELETE user by username
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const user = await Users.findOneAndRemove({ Username: req.params.Username });
    if (!user) {
      res.status(404).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' has been deleted');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// UPDATE users favorite movies
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// DELETE favorite movie
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// listen for requests
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log('Listening on port ' + port);
});