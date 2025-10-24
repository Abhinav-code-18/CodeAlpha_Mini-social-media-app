# Mini Social Media App (Express + MongoDB)

This is a demo mini social media application using Express.js and MongoDB (Mongoose).

## What is included
- Backend: Express + Mongoose
- Frontend: HTML, CSS, JavaScript (single-page feel)
- Features: Users, Posts, Comments, Likes (toggle), Follow/Unfollow
- Demo data: seed script creates sample users, posts, comments and follows

## Prerequisites
- Node.js (v16+)
- npm (comes with Node)
- MongoDB (local or Atlas). Default connection: mongodb://127.0.0.1:27017/mini_social_app
  - You can override by setting environment variable `MONGO_URL` before running the app.

## Quick start
1. Unzip the project folder.
2. Open terminal inside the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed demo data (optional but recommended):
   ```bash
   npm run seed
   ```
   > The seed script will skip inserting demo data if it detects the sample user `alice` already exists.
5. Start the server:
   ```bash
   npm start
   ```
6. Open in browser: http://localhost:3000

## Notes
- For demo purposes there is no authentication. Use the "Act as" dropdown in the top-right to act as a demo user; the frontend sends that user's id as `X-User-Id` header.
- To use a remote MongoDB, set `MONGO_URL` environment variable:
  ```bash
  export MONGO_URL="your_connection_string_here"   # macOS/Linux
  set MONGO_URL=your_connection_string_here        # Windows (cmd)
  ```

## Improvements you can make
- Add JWT-based auth (register/login)
- Add profile pictures/uploads
- Add pagination for the feed
- Deploy to a host (use MongoDB Atlas for DB)

