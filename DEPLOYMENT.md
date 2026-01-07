# Deployment Instructions

This project is configured as a full-stack Node.js application (Frontend + Backend) coupled in a single repository. It is ready for deployment on platforms like **Render**, **Heroku**, or **Railway**.

## Prerequisites

- **MongoDB Database**: You need a MongoDB connection string (URI). You can get a free one from [MongoDB Atlas](https://www.mongodb.com/atlas/database).

## Deployment Settings

Configuration settings for your hosting platform:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Environment Variables** | See below |

### Environment Variables

You **MUST** set these environment variables in your deployment platform's dashboard:

1.  `NODE_ENV`: `production`
2.  `MONGODB_URI`: `mongodb+srv://<username>:<password>@...` (Your actual connection string)
3.  `PORT`: (Optional, usually provided automatically by the platform)

## Technical Details

- **Build Process**: The `npm run build` command installs dependencies for the Root, Backend, and Frontend, and then builds the React Frontend into `Frontend/dist`.
- **Runtime**: The `npm start` command runs `Backend/index.js`, which serves the API *and* the static frontend files (when `NODE_ENV` is `production`).

## Local Production Test

To test the production build locally before deploying:

1.  Run `npm run build`
2.  Set `NODE_ENV=production` (or just rely on the fallback if you modified the code, but best to set it)
3.  Run `npm start`
4.  Open `http://localhost:5000` (or whatever port is logged). You should see the App, not just the JSON API.
