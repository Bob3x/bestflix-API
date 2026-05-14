const passport = require("passport");
const { ExtractJwt, Strategy: JwtStrategy } = require("passport-jwt");

const { getProfileById } = require("./neonDatabase");

const jwtSecret = process.env.JWT_SECRET || "bestflix-development-secret";

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret
        },
        async (payload, done) => {
            try {
                const userId = payload.id || payload.sub;
                const profile = await getProfileById(userId);

                if (!profile) {
                    return done(null, false);
                }

                return done(null, profile);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

module.exports = passport;
