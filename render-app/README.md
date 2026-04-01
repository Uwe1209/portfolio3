# Render Credit Task App

This repository contains a simple Node.js and Express web app prepared for deployment to Render.

## Features

- Reads configuration from Render environment variables
- Uses `npm install` as the build command
- Uses `npm start` as the start command
- Supports auto-deploy from Git push
- Includes a `/health` route for quick verification

## Environment variables

- `APP_TITLE`: page heading
- `APP_MESSAGE`: hero text shown on the homepage
- `DEFAULT_AUTHOR`: fallback name for notes
- `SEED_NOTES`: initial notes separated by `|`

## Local run

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Render setup

If you create the service from this repository, Render can read [`render.yaml`](./render.yaml) for the build command, start command, and environment variables.

To satisfy the deactivation requirement for the Credit task, open the Render dashboard after deployment and suspend or delete the web service once you have captured your screenshots.
