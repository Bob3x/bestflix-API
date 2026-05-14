const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const moviesFileCandidates = [
    path.join(__dirname, "movies_collection.json"),
    path.join(__dirname, "exported_collections", "movies_collection.json")
];

const moviesFilePath = moviesFileCandidates.find((candidate) => fs.existsSync(candidate));

const movies = loadMovies();

const pool = process.env.DATABASE_URL
    ? new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl:
              process.env.DATABASE_SSL === "false"
                  ? false
                  : {
                        rejectUnauthorized: false
                    }
      })
    : null;

if (pool) {
    pool.on("error", (error) => {
        console.error("Neon pool error:", error);
    });
}

function loadMovies() {
    if (!moviesFilePath) {
        return [];
    }

    const content = fs.readFileSync(moviesFilePath, "utf8");
    return content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line));
}

function toPublicProfile(profileRow) {
    if (!profileRow) {
        return null;
    }

    return {
        id: Number(profileRow.id),
        email: profileRow.email,
        username: profileRow.username,
        avatar_url: profileRow.avatar_url || "",
        created_at: profileRow.created_at
    };
}

function toFavoriteRow(favoriteRow) {
    if (!favoriteRow) {
        return null;
    }

    return {
        id: Number(favoriteRow.id),
        user_id: Number(favoriteRow.user_id),
        movie_id: String(favoriteRow.movie_id),
        created_at: favoriteRow.created_at
    };
}

async function query(text, values = []) {
    if (!pool) {
        throw new Error("DATABASE_URL is not configured");
    }

    return pool.query(text, values);
}

async function getProfileRecordById(id) {
    const result = await query("SELECT * FROM profiles WHERE id = $1 LIMIT 1", [Number(id)]);
    return result.rows[0] || null;
}

async function getProfileRecordByEmail(email) {
    const result = await query("SELECT * FROM profiles WHERE lower(email) = lower($1) LIMIT 1", [
        email
    ]);
    return result.rows[0] || null;
}

async function getProfileRecordByUsername(username) {
    const result = await query("SELECT * FROM profiles WHERE lower(username) = lower($1) LIMIT 1", [
        username
    ]);
    return result.rows[0] || null;
}

async function getProfileById(id) {
    return toPublicProfile(await getProfileRecordById(id));
}

async function getProfileByEmail(email) {
    return toPublicProfile(await getProfileRecordByEmail(email));
}

async function getProfileByUsername(username) {
    return toPublicProfile(await getProfileRecordByUsername(username));
}

async function listProfiles() {
    const result = await query("SELECT * FROM profiles ORDER BY id ASC");
    return result.rows.map(toPublicProfile);
}

async function createProfile({ email, password, username, avatarUrl = "" }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
        `INSERT INTO profiles (email, password, username, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [email.toLowerCase(), passwordHash, username, avatarUrl]
    );
    return toPublicProfile(result.rows[0]);
}

async function updateProfileById(id, updates) {
    const fields = [];
    const values = [];

    if (updates.email !== undefined) {
        values.push(updates.email.toLowerCase());
        fields.push(`email = $${values.length}`);
    }

    if (updates.username !== undefined) {
        values.push(updates.username);
        fields.push(`username = $${values.length}`);
    }

    if (updates.avatarUrl !== undefined) {
        values.push(updates.avatarUrl);
        fields.push(`avatar_url = $${values.length}`);
    }

    if (updates.password !== undefined) {
        const passwordHash = await bcrypt.hash(updates.password, 10);
        values.push(passwordHash);
        fields.push(`password = $${values.length}`);
    }

    if (!fields.length) {
        return getProfileById(id);
    }

    values.push(Number(id));
    const result = await query(
        `UPDATE profiles
         SET ${fields.join(", ")}
         WHERE id = $${values.length}
         RETURNING *`,
        values
    );

    return toPublicProfile(result.rows[0]);
}

async function deleteProfileById(id) {
    const result = await query("DELETE FROM profiles WHERE id = $1 RETURNING *", [Number(id)]);
    return toPublicProfile(result.rows[0]);
}

async function resolveProfileIdentifier(identifier) {
    if (identifier === undefined || identifier === null) {
        return null;
    }

    const value = String(identifier).trim();
    if (!value) {
        return null;
    }

    if (/^\d+$/.test(value)) {
        const byId = await getProfileRecordById(value);
        if (byId) {
            return Number(byId.id);
        }
    }

    const byUsername = await getProfileRecordByUsername(value);
    if (byUsername) {
        return Number(byUsername.id);
    }

    const byEmail = await getProfileRecordByEmail(value);
    if (byEmail) {
        return Number(byEmail.id);
    }

    return null;
}

async function verifyPassword(plainTextPassword, hash) {
    return bcrypt.compare(plainTextPassword, hash);
}

async function listFavoritesByUserId(userId) {
    const result = await query(
        `SELECT id, user_id, movie_id, created_at
         FROM favorites
         WHERE user_id = $1
         ORDER BY created_at ASC, id ASC`,
        [Number(userId)]
    );

    return result.rows.map(toFavoriteRow);
}

async function addFavorite({ userId, movieId }) {
    const inserted = await query(
        `INSERT INTO favorites (user_id, movie_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, movie_id) DO NOTHING
         RETURNING id, user_id, movie_id, created_at`,
        [Number(userId), String(movieId)]
    );

    if (inserted.rows[0]) {
        return toFavoriteRow(inserted.rows[0]);
    }

    const existing = await query(
        `SELECT id, user_id, movie_id, created_at
         FROM favorites
         WHERE user_id = $1 AND movie_id = $2
         LIMIT 1`,
        [Number(userId), String(movieId)]
    );

    return toFavoriteRow(existing.rows[0]);
}

async function removeFavorite({ userId, movieId }) {
    const result = await query(
        `DELETE FROM favorites
         WHERE user_id = $1 AND movie_id = $2
         RETURNING id, user_id, movie_id, created_at`,
        [Number(userId), String(movieId)]
    );

    return toFavoriteRow(result.rows[0]);
}

function findAllMovies() {
    return movies;
}

function findMovieByTitle(title) {
    return movies.find((movie) => movie.Title === title) || null;
}

function findMovieByDirector(name) {
    return movies.find((movie) => movie.Director && movie.Director.Name === name) || null;
}

function findMovieByGenre(name) {
    return movies.find((movie) => movie.Genre && movie.Genre.Name === name) || null;
}

module.exports = {
    addFavorite,
    createProfile,
    deleteProfileById,
    findAllMovies,
    findMovieByDirector,
    findMovieByGenre,
    findMovieByTitle,
    getProfileByEmail,
    getProfileById,
    getProfileByUsername,
    getProfileRecordByEmail,
    getProfileRecordById,
    getProfileRecordByUsername,
    listFavoritesByUserId,
    listProfiles,
    movies,
    query,
    removeFavorite,
    resolveProfileIdentifier,
    toFavoriteRow,
    toPublicProfile,
    updateProfileById,
    verifyPassword
};
