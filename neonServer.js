require("dotenv").config();

const express = require("express");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

const middleware = require("./middleware");
require("./neonPassport");
const authRoutes = require("./neonAuth");
const {
    addFavorite,
    deleteProfileById,
    findAllMovies,
    findMovieByDirector,
    findMovieByGenre,
    findMovieByTitle,
    getProfileById,
    listFavoritesByUserId,
    listProfiles,
    removeFavorite,
    resolveProfileIdentifier,
    updateProfileById
} = require("./neonDatabase");

const app = express();

middleware(app);
app.use(passport.initialize());

authRoutes(app);

app.get("/", (_req, res) => {
    res.send("Welcome to the Bestflix API!");
});

app.get("/documentation", (_req, res) => {
    try {
        res.sendFile("public/documentation.html", { root: __dirname });
    } catch (error) {
        console.log("Documentation error:", error);
        res.status(500).json({ error: "Error serving documentation" });
    }
});

app.get("/api/movies", passport.authenticate("jwt", { session: false }), async (_req, res) => {
    try {
        res.status(200).json(findAllMovies());
    } catch (error) {
        console.error("Movie lookup error:", error);
        res.status(500).json({ error: "Error fetching movies" });
    }
});

app.get(
    "/api/movies/:Title",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const movie = findMovieByTitle(req.params.Title);
            if (!movie) {
                return res.status(404).json({ error: "Movie not found" });
            }
            return res.json(movie);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error fetching movie" });
        }
    }
);

app.get(
    "/api/movies/Director/:Name",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const movie = findMovieByDirector(req.params.Name);
            if (!movie) {
                return res.status(404).json({ error: "Director not found" });
            }
            return res.json(movie);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error fetching movie" });
        }
    }
);

app.get(
    "/api/movies/Genre/:Name",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const movie = findMovieByGenre(req.params.Name);
            if (!movie) {
                return res.status(404).json({ error: "Genre not found" });
            }
            return res.json(movie);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error fetching movie" });
        }
    }
);

app.get("/api/users", async (_req, res) => {
    try {
        const profiles = await listProfiles();
        res.status(200).json(profiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching users" });
    }
});

app.get(
    "/api/users/:identifier",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const profileId = await resolveProfileIdentifier(req.params.identifier);
            if (!profileId) {
                return res.status(404).json({ error: "User not found" });
            }

            if (req.user.id !== profileId) {
                return res.status(403).json({ error: "Permission denied" });
            }

            const profile = await getProfileById(profileId);
            return res.json(profile);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error fetching user" });
        }
    }
);

app.put(
    "/api/users/:identifier",
    passport.authenticate("jwt", { session: false }),
    [
        body("username").optional().isLength({ min: 3 }),
        body("email").optional().isEmail(),
        body("avatar_url").optional().isString(),
        body("password").optional().isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                return res.status(422).json({ errors: validationErrors.array() });
            }

            const profileId = await resolveProfileIdentifier(req.params.identifier);
            if (!profileId) {
                return res.status(404).json({ error: "User not found" });
            }

            if (req.user.id !== profileId) {
                return res.status(403).json({ error: "Permission denied" });
            }

            const updatedProfile = await updateProfileById(profileId, {
                email: req.body.email || req.body.Email,
                username: req.body.username || req.body.Username,
                avatarUrl: req.body.avatar_url || req.body.avatarUrl,
                password: req.body.password || req.body.Password
            });

            return res.json(updatedProfile);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error updating user" });
        }
    }
);

app.delete(
    "/api/users/:identifier",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const profileId = await resolveProfileIdentifier(req.params.identifier);
            if (!profileId) {
                return res.status(404).json({ error: "User not found" });
            }

            if (req.user.id !== profileId) {
                return res.status(403).json({ error: "Permission denied" });
            }

            await deleteProfileById(profileId);
            return res.status(200).json({ ok: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error deleting user" });
        }
    }
);

app.get(
    "/api/favorites/:userId",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const profileId = await resolveProfileIdentifier(req.params.userId);
            if (!profileId) {
                return res.status(404).json({ error: "User not found" });
            }

            if (req.user.id !== profileId) {
                return res.status(403).json({ error: "Permission denied" });
            }

            const favorites = await listFavoritesByUserId(profileId);
            return res.json(favorites);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error fetching favorites" });
        }
    }
);

app.post("/api/favorites", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const profileId = await resolveProfileIdentifier(req.body.user_id || req.body.userId);
        const movieId = req.body.movie_id || req.body.movieId;

        if (!profileId || !movieId) {
            return res.status(400).json({ error: "user_id and movie_id are required" });
        }

        if (req.user.id !== profileId) {
            return res.status(403).json({ error: "Permission denied" });
        }

        const favorite = await addFavorite({ userId: profileId, movieId });
        return res.status(201).json(favorite);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error adding favorite" });
    }
});

app.delete("/api/favorites", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const profileId = await resolveProfileIdentifier(req.body.user_id || req.body.userId);
        const movieId = req.body.movie_id || req.body.movieId;

        if (!profileId || !movieId) {
            return res.status(400).json({ error: "user_id and movie_id are required" });
        }

        if (req.user.id !== profileId) {
            return res.status(403).json({ error: "Permission denied" });
        }

        const removedFavorite = await removeFavorite({ userId: profileId, movieId });
        if (!removedFavorite) {
            return res.status(404).json({ error: "Favorite not found" });
        }

        return res.json({ ok: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error removing favorite" });
    }
});

app.post(
    "/api/users/:identifier/movies/:movieId",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const profileId = await resolveProfileIdentifier(req.params.identifier);
            if (!profileId) {
                return res.status(404).json({ error: "User not found" });
            }

            if (req.user.id !== profileId) {
                return res.status(403).json({ error: "Permission denied" });
            }

            const favorite = await addFavorite({ userId: profileId, movieId: req.params.movieId });
            return res.status(201).json(favorite);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error adding favorite" });
        }
    }
);

app.delete(
    "/api/users/:identifier/movies/:movieId",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const profileId = await resolveProfileIdentifier(req.params.identifier);
            if (!profileId) {
                return res.status(404).json({ error: "User not found" });
            }

            if (req.user.id !== profileId) {
                return res.status(403).json({ error: "Permission denied" });
            }

            const removedFavorite = await removeFavorite({
                userId: profileId,
                movieId: req.params.movieId
            });
            if (!removedFavorite) {
                return res.status(404).json({ error: "Favorite not found" });
            }

            return res.json({ ok: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error removing favorite" });
        }
    }
);

app.get("*", (req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
    }

    return res.sendFile("index.html", { root: __dirname + "/public" });
});

app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
});

const port = process.env.PORT || 8080;

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
}).on("error", (error) => {
    console.error("Server failed to start:", error);
});

module.exports = app;
