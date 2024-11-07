const express = require('express');
const passport = require('passport');
const { check, validationResult } = require('express-validator');

const app = express();

// Middleware import
require ('./middleware')(app);

// Database import
const { Movies, Users } = require('./database');

// Authentication
require('./passport.js');
require('./auth.js')(app); 

app.use(passport.initialize());

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
    } else {
      // If not - create new user
      const newUser = await Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      });
      res.status(201).json(newUser);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// UPDATE user's info by username
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), [
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
], async (req, res) => {
  if (req.user.Usernam !== req.params.Username) {
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