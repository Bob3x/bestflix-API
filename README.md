# Movie API

A RESTful API for managing a movie database with user authentication and authorization.

## Features

-   User athentication and authorization using JWT
-   Movie information management (CRUD operations)
-   User profile management
-   Favorite movies list per user
-   Cross-Origin Resourse Sharing (CORS) enabled
-   API documentation using JSDoc

## Technologies

-   Node.js
-   Express.js
-   MongoDB & Mongoose
-   Passport.js (JWT & Local Strategy)
-   JSDoc for documentation

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
CONNECTION_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4.Start the server:

```bash
npm start
```

## API Endpoints

### Movies

-   `GET /movies` - Get all movies (requires authentication)
-   `GET /movies/:id` - Get movie by ID
-   `POST /movies` - Add new movie (admin only)
-   `PUT /movies/:id` - Update movie (admin only)
-   `DELETE /movies/:id` - Delete movie (admin only)

### Users

-   `POST /user` - Register new user
-   `POST /login` - User login
-   `PUT /users/:Username` - Update user info
-   `POST /users/:Username/movies/:MovieID` - Add favorite movie
-   `DELETE /users/:Username/movies/:MovieID` - Remove favorite movie

### Scripts

-   `npm start` - Start the server
-   `npm run dev` - Start with nodemon
-   `npm run docs` - Generate documentation

## Dependencies

### Production

-   express - Web framework
-   mongoose - MongoDB ODM
-   passport - Authentication
-   jsonwebtoken - JWT implementation
-   bcrypt - Password hashing

### Development

-   nodemon - Development server
-   jsdoc - Documentation generator

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
