# Fifty System Architecture Specification

## 1. Overview
**Fifty** is a decoupled, modern audio streaming client and server architecture designed for low-latency playback, resilient seek operations, and edge-to-edge mobile viewing.

---

## 2. Core Subsystems

### 2.1 Web Audio Engine (`src/services/audioEngine.ts`)
- **Dual-Bus Audio Pipeline**: Connects standard HTML5 Audio to a Web Audio API `AudioContext` and dynamic `GainNode`.
- **Zero-Stutter Attenuation**: During seek scrub operations, the gain node ramps down to `0` instantaneously. Once the browser audio buffer fires the native `'seeked'` event, volume ramps back smoothly via exponential curve, eliminating the 1-2s stale audio leak common in web players.
- **Microsecond Timestamp Sync**: Exposes active playback time, buffered time, and duration state to subscribers at 60fps.

### 2.2 Streaming Proxy Service (`server.js`)
- **HTTP 206 Partial Content**: Fully honors `Range: bytes=start-end` requests from modern mobile browsers.
- **Upstream Pipe**: Leverages `Readable.fromWeb()` to stream chunks directly to the client without loading full media files into server memory.
- **Metadata Caching**: In-memory LRU/Map caches (`searchCache`, `resolveCache`) for instantaneous response times on repeated queries.

### 2.3 Mobile-First UX Engine
- **Edge-to-Edge Navigation**: Replaces traditional desktop wrappers with 100% viewport (`100dvh`) utilization with Apple UIKit safe-area insets (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).
- **Sub-Pixel Pointer Capture**: Touch-based scrubbing utilizes `setPointerCapture` to maintain continuous scrub tracking even if the user's finger slips outside the bounding box.
- **Dynamic Palette Mesh**: Generates ambient complementary gradient backdrops extracted from track metadata hashes and artwork.

---

## 3. Data Flow

```
[ Client Request ] ────► [ Express Router ] ────► [ Cache Check ]
                                                        │
                      ┌─────────────────────────────────┴─────────────────┐
                      │ Hit                                               │ Miss
                      ▼                                                   ▼
              [ Return Cached ]                                  [ Upstream Resolver ]
                                                                          │
                                                                          ▼
                                                                 [ Stream Audio / 206 ]
```
