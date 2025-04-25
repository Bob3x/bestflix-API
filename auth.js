/**
 * @module Authentication
 * @description JWT authentication module for user login
 * @requires jsonwebtoken
 * @requires passport
 */

const jwtSecret = "your_jwt_secret";
const jwt = require("jsonwebtoken"),
    passport = require("passport");

require("./passport.js");

/**
 * Generates JWT token for authenticated user
 * @function generateJWTToken
 * @param {Object} user - User document from MongoDB
 * @returns {string} JWT token
 * @description Creates a signed JWT token containing user data
 * @example
 * // Returns JWT token string
 * generateJWTToken({
 *   Username: "testuser",
 *   _id: "123456"
 * })
 */
let generateJWTToken = (user) => {
    return jwt.sign(user.toJSON(), jwtSecret, {
        subject: user.Username, // This is the username encoded in the JWT
        expiresIn: "7d", // This specifies that the token will expire in 7 days
        algorithm: "HS256" // This is the algorithm used to "sign" or encode the values of the JWT
    });
};

/**
 * Login endpoint
 * @route POST /login
 * @param {Object} req.body.Username - Username
 * @param {Object} req.body.Password - Password
 * @returns {Object} User object with JWT token
 * @throws {Error} 400 - Username and password required
 * @throws {Error} 401 - Authentication failed
 * @example
 * // Request
 * {
 *   "Username": "testuser",
 *   "Password": "password123"
 * }
 *
 * // Success Response: 200 OK
 * {
 *   "user": {
 *     "Username": "testuser",
 *     "_id": "123456"
 *   },
 *   "token": "JWT_TOKEN_STRING"
 * }
 *
 * // Error Response: 400 Bad Request
 * {
 *   "message": "Username and password are required"
 * }
 */
module.exports = (router) => {
    router.post("/api/login", (req, res, next) => {
        // Validation request body
        if (!req.body.Username || !req.body.Password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        passport.authenticate("local", { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(401).json("Failed to login " + info.message);
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    console.log("Login error");
                    return res.status(500).json({
                        message: "Login error",
                        error: error.message
                    });
                }
                let token = generateJWTToken(user);
                return res.json({
                    user: user,
                    token: token
                });
            });
        })(req, res, next);
    });
    return router;
};
