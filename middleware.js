/**
 * @module Middleware
 * @description Express middleware configuration and setup
 * @requires morgan - HTTP request logger
 * @requires cors - Cross-Origin Resource Sharing
 * @requires express - Express framework
 */
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");

/**
 * Configure and apply middleware to Express app
 * @function configureMiddleware
 * @param {Express} app - Express application instance
 * @description Sets up CORS, body parsing, logging, and static file serving
 * @example
 * // In your main app file:
 * const configureMiddleware = require('./middleware');
 * configureMiddleware(app);
 */

module.exports = (app) => {
    // CORS configuration
    app.use(
        cors({
            origin: [
                "http://localhost:8080",
                "http://localhost:1234",
                "https://my-movies-flix-app-56f9661dc035.herokuapp.com",
                "https://my-movie-flix.netlify.app"
            ],
            credentials: true
        })
    );
    // Request body parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Request logging
    app.use(morgan("combined"));
    // Static file serving
    app.use(express.static("public"));
};
