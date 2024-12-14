/**
 * @module Middleware
 * @description Express middleware configuration and setup for Movie API
 * @requires morgan - HTTP request logger middleware
 * @requires cors - Cross-Origin Resource Sharing middleware
 * @requires express - Express framework
 */
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");

/**
 * Configure and apply middleware to Express app
 * @function configureMiddleware
 * @param {Express} app - Express application instance
 * @description Sets up middleware chain for request processing:
 * - Request logging (morgan)
 * - CORS handling
 * - Body parsing
 * - Static file serving
 * - Error handling
 */
module.exports = (app) => {
    // Request logging
    app.use(morgan("dev"));

    // CORS configuration
    app.use(
        cors({
            origin: [
                "http://localhost:8080",
                "http://localhost:1234",
                "http://localhost:4200",
                "https://my-movies-flix-app-56f9661dc035.herokuapp.com",
                "https://spontaneous-gelato-a5144f.netlify.app",
                "https://papaya-naiad-bfbccf.netlify.app"
            ],
            methods: ["GET", "POST", "PUT", "DELETE"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true
        })
    );

    // Request body parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Static file serving
    app.use(express.static("public"));

    /**
     * Error handling middleware
     * @function errorHandler
     * @param {Error} err - Error object
     * @param {Request} _req - Express request object (unused)
     * @param {Response} res - Express response object
     * @param {NextFunction} _next - Express next function (unused)
     * @returns {Response} Error response
     */
    app.use((err, _req, res, _next) => {
        console.error(err.stack);
        res.status(500).send("Something broke!");
    });
};
