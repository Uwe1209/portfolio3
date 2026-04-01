# Render High Distinction Task App

This repository contains a simple full-stack Node.js and Express web app prepared for deployment to Render with PostgreSQL.

## Features

- Reads configuration from Render environment variables
- Uses `npm install` as the build command
- Uses `npm start` as the start command
- Supports auto-deploy from Git push
- Includes a `/health` route for quick verification
- Reads and writes notes from PostgreSQL when `DATABASE_URL` is set
- Falls back to in-memory storage for local development without a database

## Environment variables

- `APP_TITLE`: page heading
- `APP_MESSAGE`: hero text shown on the homepage
- `DEFAULT_AUTHOR`: fallback name for notes
- `SEED_NOTES`: initial notes separated by `|`
- `DATABASE_URL`: PostgreSQL connection string supplied by Render

## Local run

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Render setup

If you create the services from this repository, Render can read [`render.yaml`](./render.yaml) for:

- the PostgreSQL database
- the web service
- the build command
- the start command
- the environment variables

## High Distinction checklist

1. Push this repository to your Git provider.
2. In Render, create the blueprint from the repository so both the database and web service are provisioned.
3. Wait for the initial deployment to finish.
4. Open the public Render URL and add a few notes.
5. Refresh the page to show the notes persist.
6. Capture screenshots of the Render database, the web service, and the live app with working note creation.

For the earlier Credit deactivation requirement, you can still suspend or delete the web service after you finish the live demo and screenshots.
