# chess-app-2

Simple 3D chess demo built with Three.js + Vite.

## Features

- 3D chess board and complete starting piece layout
- Orbit camera controls (drag to rotate, scroll to zoom)
- Subtle square hover highlighting for interaction

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repository is configured for project-page hosting under `/chess-app-2/`.

```bash
npm run deploy
```

This publishes the `dist/` output to the `gh-pages` branch.

If you change the repository name, update `base` in `/home/runner/work/chess-app-2/chess-app-2/vite.config.mjs` to match the new path.
