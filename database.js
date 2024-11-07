// Database
const mongoose = require('mongoose');
const Models = require('./models.js');

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

  module.exports = {
    Movies: Models.Movie,
    Users: Models.User
  };