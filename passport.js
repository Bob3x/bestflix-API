/**
 * @module PassportAuth
 * @description Passport authentication strategies configuration
 * @requires passport
 * @requires passport-local
 * @requires passport-JWT
 * @requires ../models/users
 */

const passport = require("passport");
const passportJWT = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const Models = require("./models.js");
const Users = Models.User;

/**
 * Local authentication strategy
 * @function LocalStrategy
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Object} User object if authenticated
 * @throws {Error} Authentication failed
 * @example
 * // Success case
 * passport.authenticate('local')
 * // Returns user object
 *
 * // Failure case
 * // Returns false with error message
 */
passport.use(
    new LocalStrategy(
        {
            usernameField: "Username",
            passwordField: "Password"
        },
        async (username, password, callback) => {
            try {
                const user = await Users.findOne({ Username: username });
                if (!user) {
                    console.log("incorrect username");
                    return callback(null, false, {
                        message: "Incorrect username or password."
                    });
                }
                if (!user.validatePassword(password)) {
                    console.log("incorrect password");
                    return callback(null, false, {
                        message: "Incorrect password."
                    });
                }
                console.log("finished");
                return callback(null, user);
            } catch (error) {
                console.log(error);
                return callback(error);
            }
        }
    )
);

/**
 * JWT authentication strategy
 * @function JWTStrategy
 * @param {Object} jwtPayload - Decoded JWT payload
 * @returns {Object} User object if token valid
 * @throws {Error} Token validation failed
 * @example
 * // Request header
 * Authorization: Bearer <jwt_token>
 *
 * // Success: Returns user object
 * // Failure: Returns error
 */
passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: "your_jwt_secret"
        },
        async (jwtPayload, callback) => {
            try {
                const user = await Users.findById(jwtPayload._id);
                return callback(null, user);
            } catch (error) {
                return callback(error);
            }
        }
    )
);
