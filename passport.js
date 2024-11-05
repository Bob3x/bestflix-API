const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User; 
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField: 'Password',
        },
        async (username, password, callback) => {
            try {
                const user = await Users.findOne({ Username: username });
                if (!user) {
                    console.log('incorrect username');
                    return callback(null, false, {
                        message: "Incorrect username or password.",
                    });
                }
                if (!user.validatePassword(password)) {
                    console.log('incorrect password');
                    return callback(null, false, {
                        message: "Incorrect password.",
                    });
                }
                console.log('finished');
                return callback(null, user);
            } catch (error) {
                console.log(error);
                return callback(error);
            }
        }
    )
);

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (jwtPayload, callback) => {
    try {
        const user = await Users.findById(jwtPayload._id);
        if (user) {
        return callback(null, user);
        }
    } catch (error) {
        return callback(error);
    }
}));