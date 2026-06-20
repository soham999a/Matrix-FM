# MATRIX FM

Precision radio streaming — worldwide stations, zero noise.

Built with React 19, TypeScript, Tailwind v4, Vite 8, and the radio-browser.info API.

## Features

- **Live Radio Streaming** — Thousands of stations worldwide via radio-browser.info
- **Audio Spectrum Analyser** — Real-time FFT visualization synced to the audio stream
- **Recently Played** — Last 10 stations persisted locally
- **Favorites** — Save stations with one tap
- **Sleep Timer** — 15/30/45/60 minute countdown with auto-stop
- **Search** — Global station search with recent queries
- **Curated Regions** — 8 regions with editor-curated station picks
- **PWA Ready** — Manifest, service worker, installable
- **MATRIX Design System** — Ink (#0A0A0A), Bone (#F5F0EB), Gold (#C9A84C), Slate (#6B6B6B)

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Language | TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 (HashRouter) |
| Data Fetching | @tanstack/react-query |
| Icons | lucide-react |
| Audio API | Web Audio API (AnalyserNode) |
| Streaming | HTMLAudioElement + radio-browser.info |

## Getting Started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
npm run preview  # preview production build
```

## Deployment

The app is fully static — built output goes in `dist/`. Deploy to Vercel:

```bash
npm run build
npx vercel --prod
```

Or push to GitHub and connect Vercel to auto-deploy.

## License

MIT
