// Middleware
const morgan = require('morgan');
const cors = require('cors');
const express = require('express');

module.exports = (app) =>{
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('combined'));           // Morgan middleware to log all requests to the terminal
    app.use(express.static('public'));     // Serve static files from the "public" directory
};