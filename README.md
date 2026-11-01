# Fifty — High-Fidelity Web & Mobile Audio Streaming Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.3-cyan.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.3-teal.svg)](https://tailwindcss.com/)
[![Node](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)

**Fifty** is a high-performance, open-source music streaming web application and mobile audio player. Engineered from the ground up with modern web technologies, Fifty delivers studio-grade audio streaming, synchronized real-time lyrics, smooth pointer-captured scrubbing, and an edge-to-edge mobile interface designed for both browser and standalone PWA environments.

---

## Key Features

### 1. Studio-Grade Audio Streaming Engine
- **Chunked HTTP Range Streaming**: Implements full `HTTP 206 Partial Content` audio piping for instant playback start times without downloading entire audio files.
- **Microsecond Web Audio Attenuation**: Eliminates hardware buffer drain and stale audio replay during rapid forward/backward scrubbing via dynamic software gain ramping.
- **Adaptive Stream Resolution**: Intelligent resolver with high-bitrate AAC format matching (`audio/mp4` container at ~130kbps+).

### 2. Modern Mobile-First UX
- **Edge-to-Edge Native Experience**: Built with dynamic viewport height (`100dvh`) and iOS safe area awareness (`pt-safe`, `pb-safe`) for a true native mobile feel.
- **Pointer-Captured Scrubbing**: 60fps continuous scrubber with native sub-pixel tracking and zero touch cancellation on mobile Safari and Chrome.
- **Ambient Chromatic Mesh**: Dynamic real-time color extraction from active track artwork, generating fluid ambient gradients across the player modal and playlist headers.

### 3. Rich Player Capabilities
- **Synchronized Lyrics Engine**: Live time-coded lyrics drawer that smoothly highlights and tracks playback progress.
- **Queue Management & Quick Toggles**: Shuffle algorithm with randomized permutation tracking, multi-state repeat (Off / All / One), and device handoff selection modal.
- **Persistent Floating Mini-Player**: Unobtrusive bottom player floating above navigation with live playback state and progress bar.
- **Fast Search & Instant Discovery**: In-memory caching layer (`searchCache`, `resolveCache`) providing sub-50ms search query response times.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript |
| **Styling & Design** | Tailwind CSS 4, Plus Jakarta Sans, Lucide Icons |
| **Audio Processing** | Web Audio API (`AudioContext`, `GainNode`) & HTML5 Audio |
| **Streaming Backend** | Node.js, Express 5, Stream Piping (`Readable.fromWeb`) |
| **Build Tooling** | Vite 8, Rollup |
| **Deployment** | PWA-ready, Koyeb / Render / Docker compatible |

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   Fifty Mobile UI                      │
│   (HomeView | SearchView | LibraryView | MiniPlayer)   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    AudioEngine                         │
│   • HTML5 Audio Element                                │
│   • Web Audio API Gain Node (Zero-Leak Attenuation)    │
│   • 60fps Pointer-Captured Touch Scrubber              │
└───────────────────────────┬────────────────────────────┘
                            │ Range Requests (bytes=...)
┌───────────────────────────▼────────────────────────────┐
│                 Fifty Streaming API                    │
│   • /api/search   - In-Memory Query & Metadata Caching │
│   • /api/stream   - HTTP 206 Partial Content Piping    │
│   • /api/resolve  - Track Metadata Matching            │
└────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/c1gwsg/fifty-music.git
   cd fifty-music
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Run the production streaming server**:
   ```bash
   npm start
   ```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Mobile PWA Installation

To install Fifty as a native full-screen app on iOS or Android:
1. Open Fifty in **Safari** (iOS) or **Chrome** (Android).
2. Tap the **Share** button (iOS) or **Menu** (Android).
3. Select **Add to Home Screen**.
4. Launch Fifty from your home screen for an edge-to-edge, distraction-free audio experience.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
