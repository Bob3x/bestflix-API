/**
 * @module MovieAPI
 * @description Movie management RESTful API using Express
 * @version 1.0.0
 * @requires express
 * @requires passport
 * @requires express-validator
 * @author bob3x
 * @license MIT
 */
const express = require("express");
const passport = require("passport");
const { check, validationResult } = require("express-validator");

/**
 * @requires Application modules
 */
const { Movies, Users } = require("./database");

const app = express();

/**
 * Initialize middleware and authentication
 * @requires middleware
 * @requires passport
 * @requires auth
 */
require("./middleware")(app);

require("./passport.js");
require("./auth.js")(app);

app.use(passport.initialize());
/**
 * Welcome endpoint
 * @route GET /
 * @function
 * @returns {string} Welcome message
 * @description Simple welcome message for API root
 */
app.get("/", (req, res) => {
    res.send("Welcome to my movie app!");
});
/**
 * Get documentation file
 * @route GET /documentation
 * @function
 * @returns {HTML} Documentation page
 * @description Entry point for the Movie API
 */
app.get("/documentation", (req, res) => {
    res.sendFile("public/documentation.html", { root: __dirname });
});
/**
 * Get all movies from database
 * @route GET /movies
 * @async
 * @func
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object[]>} Array of movie objects
 * @throws {Error} 500 - Internal server error if database operation fails
 * @requires authentication - JWT token required
 * @example
 * Headers: {
 *   "Authorization": "Bearer <jwt-token>"
 * }
 *
 * // Success Response: 200 OK
 * [{
 *   "Title": "Movie Name",
 *   "Description": "Movie Description",
 *   "Genre": {
 *      "Name": "Genre Name - Drama",
 *      "Description": "Genre Description"
 * },
 *    "Director": {
 *       "Name": "Director Name",
 *       "Bio": "Director Bio",
 *       "Birth": "Director Birth Date"
 * },
 *     "Featured": true,
 *     "ImagePath": "Movie Cover Image"
 * }]
 * // Error Response: 500 Internal Server Error
 * {
 *   "error": "Database error message"
 * }
 */
app.get("/movies", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const movies = await Movies.find();
        res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json("Error: " + error);
    }
});

/**
 * Single movie by Title
 * @route GET /movies/:Title
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object[]>} Array of movie objects
 * @throws {Error} 500 - Internal server error if database operation fails
 * @requires authentication - JWT token required
 */
app.get("/movies/:Title", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const movie = await Movies.findOne({ Title: req.params.Title });
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json("Movie not found.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json("Error: " + err);
    }
});

/**
 * Single movie by Director's name
 * @route GET /movies/:Title
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object[]>} Array of movie objects
 * @throws {Error} 404 - Not found
 * @requires authentication - JWT token required
 */
app.get(
    "/movies/Director/:Name",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const movie = await Movies.findOne({ "Director.Name": req.params.Name });
            if (movie) {
                res.json(movie);
            } else {
                res.status(404).json("Director not found.");
            }
        } catch (err) {
            console.error(err);
            res.status(500).json("Error: " + err);
        }
    }
);

/**
 * Single movie by Genre
 * @route GET /movies/:Title
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object[]>} Array of movie objects
 * @throws {Error} 500 - Internal server error if database operation fails
 * @requires authentication - JWT token required
 */
app.get(
    "/movies/Genre/:Name",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const movie = await Movies.findOne({ "Genre.Name": req.params.Name });
            if (movie) {
                res.json(movie);
            } else {
                res.status(404).json("Genre not found.");
            }
        } catch (err) {
            console.error(err);
            res.status(500).json("Error: " + err);
        }
    }
);

/**
 * Get all users
 * @route GET /users
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object[]>} Array user objects
 * @throws {Error} 500 - Internal server error if database operation fails
 */
app.get("/users", async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json("Error: " + err);
    }
});

/**
 * User registration endpoint
 * @route POST /users
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object[]>} Returns message
 * @throws {Error} 500 - Internal server error if database operation fails
 */
app.post(
    "/users",
    [
        check("Username", "Username is required").isLength({ min: 5 }),
        check(
            "Username",
            "Username contains non alphanumeric characters - not allowed."
        ).isAlphanumeric(),
        check("Password", "Password is required").not().isEmpty(),
        check("Email", "Email is not valid").isEmail()
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const hashedPassword = Users.hashPassword(req.body.Password);
            const user = await Users.findOne({ Username: req.params.Username });
            if (user) {
                // If the user already exists
                return res.status(400).json(req.params.Username + " already exists");
            } else {
                // If not - create new user
                const newUser = await Users.create({
                    Username: req.body.Username,
                    Email: req.body.Email,
                    Password: hashedPassword,
                    Birthday: req.body.Birthday
                });
                res.status(201).json(newUser);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json("Error: " + error);
        }
    }
);

/**
 * User update endpoint
 * @route PUT /users/:Username
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object[]>} Returns message
 * @throws {Error} 500 - Internal server error if database operation fails
 * @requires authentication - JWT token required
 */
app.put(
    "/users/:Username",
    passport.authenticate("jwt", { session: false }),
    [
        check("Username", "Username is required").isLength({ min: 5 }),
        check(
            "Username",
            "Username contains non alphanumeric characters - not allowed."
        ).isAlphanumeric(),
        check("Password", "Password is required").not().isEmpty()
    ],
    async (req, res) => {
        if (req.user.Username !== req.params.Username) {
            return res.status(400).json("Permision denied.");
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
            res.status(500).json("Error: " + error);
        }
    }
);

/**
 * Delete user endpoint
 * @route DELETE /users/:Username
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object[]>} Returns message
 * @throws {Error} 500 - Internal server error if database operation fails
 * @requires authentication - JWT token required
 */
app.delete(
    "/users/:Username",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const user = await Users.findOneAndDelete({ Username: req.params.Username });
            if (!user) {
                res.status(404).json({ message: req.params.Username + " was not found" });
            } else {
                res.status(200).json({ message: req.params.Username + " has been deleted" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json("Error: " + error);
        }
    }
);

/**
 * Update Favorite Movies
 * @route POST /users/:Username/movies/:MoviesID
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object[]>} Array of movie objects
 * @throws {Error} 500 - Internal server error if database operation fails
 * @requires authentication - JWT token required
 */
app.post(
    "/users/:Username/movies/:MovieID",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const updatedUser = await Users.findOneAndUpdate(
                { Username: req.params.Username },
                { $push: { FavoriteMovies: req.params.MovieID } },
                { new: true }
            );
            res.json(updatedUser);
        } catch (error) {
            console.error(error);
            res.status(500).json("Error: " + error);
        }
    }
);

/**
 * Delete Favorite Movie
 * @route DELETE /users/:Username/movies/:MovieID
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object[]>} Returns message
 * @throws {Error} 500 - Internal server error if database operation fails
 * @requires authentication - JWT token required
 */
app.delete(
    "/users/:Username/movies/:MovieID",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const updatedUser = await Users.findOneAndDelete(
                { Username: req.params.Username },
                { $pull: { FavoriteMovies: req.params.MovieID } },
                { new: true }
            );
            res.json(updatedUser);
        } catch (error) {
            console.error(error);
            res.status(500).json("Error: " + error);
        }
    }
);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json("Something broke!");
});

// listen for requests
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log("Listening on port " + port);
});
