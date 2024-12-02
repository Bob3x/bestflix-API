/**
 * @module MongoDBConnection
 * @description Database connection configuration and model export
 * @requires mongoose
 * @requires ./models
 */

/**
 * @requires Database models and connection dependencies
 */
const mongoose = require("mongoose");
const Models = require("./models.js");

/**
 * @constant {Model} Movies - Movie model reference
 * @constant {Model} Users - User model reference
 */
const Movies = Models.Movie;
const Users = Models.User;

// Local server database connection
// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect('process.env.CONNECTION_URI', { useNewUrlParser: true, useUnifiedTopology: true });

/**
 * MongoDB Atlas connection configuration
 * @constant {string} uri - MongoDB connection URI with credentials
 * @example
 * mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname
 */
const username = encodeURIComponent("bob3x");
const password = encodeURIComponent("lEX6W7KWRvmEKiTL");
const uri = `mongodb+srv://${username}:${password}@my-db-cluster.2utmo.mongodb.net/myFlixDB?retryWrites=true&w=majority&appName=my-DB-cluster`;

/**
 * Establish MongoDB connection
 * @function connect
 * @returns {Promise} Mongoose connection promise
 * @throws {Error} Database connection error
 */
mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

/**
 * @exports {Object} Database models
 * @property {Model} Movies - Movie model
 * @property {Model} Users - User model
 */
module.exports = {
    Movies: Models.Movie,
    Users: Models.User
};
