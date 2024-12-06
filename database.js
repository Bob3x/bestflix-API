/**
 * @module MongoDBConnection
 * @description Database connection configuration and model export
 * @requires mongoose
 * @requires ./models - Database schema definitions
 */

/**
 * @requires Database models and connection dependencies
 */
const mongoose = require("mongoose");
const Models = require("./models.js");

/**
 * Movie and User model references
 * @constant {Model} Movies - Movie collection model
 * @constant {Model} Users - User collection model
 * @example
 * // Using Movies model
 * const movie = await Movies.findOne({ Title: "Movie Name" });
 *
 * // Using Users model
 * const user = await Users.findOne({ Username: "username" });
 */
const Movies = Models.Movie;
const Users = Models.User;

/**
 * MongoDB connection URI
 * @constant {string} uri - MongoDB connection string
 * @default mongodb://localhost:27017/myFlixDB
 * @example
 * // Local connection
 * mongodb://localhost:27017/myFlixDB
 *
 * // Atlas connection
 * mongodb+srv://<username>:<password>@cluster.mongodb.net/myFlixDB
 */
// const uri = process.env.CONNECTION_URI || "mongodb://localhost:27017/myFlixDB";

/**
 * MongoDB Atlas connection configuration
 * @constant {string} uri - MongoDB connection URI with credentials
 * @example
 * mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname
 */
const username = encodeURIComponent("bob3x");
const password = encodeURIComponent("lEX6W7KWRvmEKiTL");
const uri = `mongodb+srv://${username}:${password}@my-db-cluster.2utmo.mongodb.net/myFlixDB?retryWrites=true&w=majority&appName=my-DB-cluster`;*/

/**
 * Establish MongoDB connection
 * @function connect
 * @throws {Error} Connection error
 * @returns {Promise} Mongoose connection promise
 */
mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connected to MongoDB:", uri.includes("localhost") ? "Local" : "Atlas");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    });

/**
 * @exports Database models
 * @property {Model} Movies - Movie model for CRUD operations
 * @property {Model} Users - User model for CRUD operations
 */
module.exports = {
    Movies,
    Users
};
