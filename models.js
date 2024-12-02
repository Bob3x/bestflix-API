/**
 * @module Database Models
 * @description Mongoose schemas for movies and users with password hashing
 * @requires mongoose
 * @requires bcrypt
 */
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * Movie schema definition
 * @typedef {Object} Movie
 * @property {string} Title - Movie title
 * @property {string} Description - Movie description
 * @property {Object} Genre - Movie genre details
 * @property {string} Genre.Name - Genre name
 * @property {string} Genre.Description - Genre description
 * @property {Object} Director - Movie director details
 * @property {string} Director.Name - Director name
 * @property {string} Director.Bio - Director biography
 * @property {string[]} Actors - List of actors
 * @property {string} ImagePath - Movie poster image path
 * @property {boolean} Featured - Whether movie is featured
 */
let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

/**
 * User schema definition
 * @typedef {Object} User
 * @property {string} Username - Unique username
 * @property {string} Password - Hashed password
 * @property {string} Email - User email
 * @property {Date} Birthday - User birthday
 * @property {ObjectId[]} FavoriteMovies - References to favorite movies
 */
let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }]
});

/**
 * Hash password before saving
 * @function hashPassword
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

/**
 * Validate password against stored hash
 * @method validatePassword
 * @param {string} password - Password to validate
 * @returns {boolean} True if password matches
 */
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
