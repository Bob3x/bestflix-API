const jwt = require("jsonwebtoken");

const {
    createProfile,
    getProfileRecordByEmail,
    getProfileRecordByUsername,
    verifyPassword,
    toPublicProfile
} = require("./neonDatabase");

const jwtSecret = process.env.JWT_SECRET || "bestflix-development-secret";

function normalizeAuthBody(body) {
    return {
        email: body.email || body.Email || "",
        password: body.password || body.Password || "",
        username: body.username || body.Username || "",
        avatarUrl: body.avatar_url || body.avatarUrl || body.AvatarUrl || body.AvatarURL || ""
    };
}

function buildToken(profile) {
    return jwt.sign(
        {
            id: profile.id,
            email: profile.email,
            username: profile.username
        },
        jwtSecret,
        {
            subject: String(profile.id),
            expiresIn: "7d",
            algorithm: "HS256"
        }
    );
}

async function handleSignup(req, res) {
    const { email, password, username, avatarUrl } = normalizeAuthBody(req.body);

    if (!email || !password || !username) {
        return res.status(400).json({ message: "Email, username, and password are required" });
    }

    const existingEmail = await getProfileRecordByEmail(email);
    if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
    }

    const existingUsername = await getProfileRecordByUsername(username);
    if (existingUsername) {
        return res.status(409).json({ message: "Username already exists" });
    }

    const profile = await createProfile({ email, password, username, avatarUrl });
    return res.status(201).json({ user: profile, token: buildToken(profile) });
}

async function handleLogin(req, res) {
    const { email, password, username } = normalizeAuthBody(req.body);
    const identifier = email || username;

    if (!identifier || !password) {
        return res.status(400).json({ message: "Email or username and password are required" });
    }

    const profile = email
        ? await getProfileRecordByEmail(email)
        : await getProfileRecordByUsername(username);

    if (!profile) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await verifyPassword(password, profile.password);
    if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const publicProfile = toPublicProfile(profile);
    return res.json({ user: publicProfile, token: buildToken(publicProfile) });
}

module.exports = (app) => {
    app.post("/api/auth/signup", handleSignup);
    app.post("/api/users", handleSignup);

    app.post("/api/auth/login", handleLogin);
    app.post("/api/login", handleLogin);

    app.post("/api/auth/logout", (_req, res) => {
        res.json({ ok: true });
    });

    return app;
};
