# Bestflix API

A RESTful API for the Bestflix frontend with JWT authentication, Neon-backed profiles and favorites, and a movie catalog served from the existing export.

## Features

- User authentication and authorization using JWT
- Movie catalog lookups for the frontend
- User profile management
- Favorite movies per user stored in Neon
- Cross-Origin Resource Sharing (CORS) enabled
- API documentation using JSDoc

## Technologies

- Node.js
- Express.js
- PostgreSQL / Neon
- Passport.js (JWT)
- JSDoc for documentation

## Installation

1. Clone the repository:

```bash
git clone <repository-usl>
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file with:

```bash
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-bestflix-react-app.netlify.app
```

4. Start the server:

```bash
npm start
```

## Current Project Status

- **Active server files:** `neonServer.js`, `neonAuth.js`, `neonPassport.js`, `neonDatabase.js`, `middleware.js`, `index.js`
- **Archived legacy files:** moved to `_Archived/` to keep the repo tidy (these contain the previous MongoDB/Mongoose implementation): `auth.js`, `database.js`, `models.js`, `passport.js`, `routes/movies.js`, `routes/users.js`.

If you need to inspect the older MongoDB-based implementation, see the `_Archived/` folder.

## Regenerating Documentation

The `docs/` folder contains JSDoc-generated HTML from an earlier version of the project. Some pages document archived files.

To regenerate up-to-date docs for the current codebase (requires `jsdoc`):

```bash
npm install
npm run docs
```

After running `npm run docs`, open `docs/index.html` in your browser to view the documentation.

## Environment Variables (summary)

- `DATABASE_URL` — Neon/Postgres connection string used by `neonDatabase.js`
- `JWT_SECRET` — Secret for signing JWTs
- `FRONTEND_URL` — Allowed frontend origin for CORS
- Frontend apps should use `REACT_APP_API_URL` pointing to this API (e.g. `http://localhost:3001`)

## API Endpoints

### Movies

- `GET /api/movies` - Get all movies (requires authentication)
- `GET /api/movies/:Title` - Get movie by title
- `GET /api/movies/Director/:Name` - Get movie by director
- `GET /api/movies/Genre/:Name` - Get movie by genre

### Auth

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users

- `GET /api/users` - List users
- `GET /api/users/:identifier` - Get the signed-in user profile
- `PUT /api/users/:identifier` - Update user info
- `DELETE /api/users/:identifier` - Delete user profile

### Favorites

- `GET /api/favorites/:userId` - List favorites for a user
- `POST /api/favorites` - Add a favorite movie
- `DELETE /api/favorites` - Remove a favorite movie

### Scripts

- `npm start` - Start the server
- `npm run dev` - Start with nodemon
- `npm run docs` - Generate documentation

## Dependencies

### Production

- express - Web framework
- pg - PostgreSQL client for Neon
- passport - Authentication
- jsonwebtoken - JWT implementation
- bcrypt - Password hashing

### Development

- nodemon - Development server
- jsdoc - Documentation generator

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
