const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;

// Connection to MongoDB
const username = encodeURIComponent('bob3x');
const password = encodeURIComponent('lEX6W7KWRvmEKiTL');
const uri = `mongodb+srv://${username}:${password}@my-db-cluster.2utmo.mongodb.net/myFlixDB?retryWrites=true&w=majority&appName=my-DB-cluster`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// GET all movies from the database to the user
router.get('/movies', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
      const movies = await Movies.find();
      res.status(200).json(movies);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  });

  // GET movie by title
router.get('/movies/:Title', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
router.get('/movies/Director/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
router.get('/movies/Genre/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
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


  module.exports = router;