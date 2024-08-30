const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

const topThreeMovies = [
  {
    title: 'Harry Potter and the Sorcerer\'s Stone',
    director: 'J.K. Rowling'
  },
  {
    title: 'Lord of the Rings',
    director: 'J.R.R. Tolkien'
  },
  {
    title: 'Twilight',
    director: 'Stephanie Meyer'
  }
];


// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/books', (req, res) => {
  res.json(topBooks);
});

// Error-handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err.stack);
	res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});