import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Ytdl, chooseFormat } from '@distube/ytdl-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

app.use(cors());
app.use(express.json());

const ytdl = new Ytdl();

// In-memory caches for fast response
const infoCache = new Map();
const searchCache = new Map();
const resolveCache = new Map();

// Generate dynamic UI accent colors
const ACCENT_COLORS = [
  '#1db954', '#931a25', '#b82619', '#2b3a67', '#1e5f74',
  '#7a1f1d', '#96701a', '#532e82', '#e8115b', '#006450',
  '#ba5d07', '#1f2421'
];

function getAccentColor(seed) {
  let hash = 0;
  for (let i = 0; i < (seed || '').length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

function cleanTitle(raw) {
  if (!raw) return 'Unknown Title';
  return raw
    .replace(/\(Official (Music )?Video\)/gi, '')
    .replace(/\(Official Audio\)/gi, '')
    .replace(/\(Official Lyric Video\)/gi, '')
    .replace(/\[Official (Music )?Video\]/gi, '')
    .replace(/\(Lyric Video\)/gi, '')
    .replace(/\(Audio\)/gi, '')
    .replace(/\| Official Audio/gi, '')
    .replace(/\(Visualizer\)/gi, '')
    .trim();
}

function getBestAudioFormat(formats) {
  // First prefer mp4 container with AAC audio (itag 140 is standard AAC ~130kbps)
  const mp4Audio = formats.find(f => f.hasAudio && !f.hasVideo && f.container === 'mp4' && f.audioBitrate >= 100);
  if (mp4Audio) return mp4Audio;

  // Otherwise pick the highest bitrate audio format
  const audioOnly = formats.filter(f => f.hasAudio && !f.hasVideo);
  audioOnly.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
  if (audioOnly.length > 0) return audioOnly[0];

  return formats.find(f => f.hasAudio);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Fifty Full-Length Audio Engine' });
});

// Full-length Music Search API
app.get('/api/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.json([]);
  }

  const cacheKey = query.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return res.json(searchCache.get(cacheKey));
  }

  try {
    const rawResults = await ytdl.search(query);
    if (!Array.isArray(rawResults)) {
      return res.json([]);
    }

    const tracks = rawResults
      .filter(item => {
        const sec = item.lengthSeconds || 0;
        // Keep songs between 45 seconds and 15 minutes (excludes 10-second shorts and 1-hour loops)
        return sec >= 45 && sec <= 900;
      })
      .slice(0, 30)
      .map(item => {
        const cleaned = cleanTitle(item.title);
        const artist = item.author?.name || 'Artist';
        const cover = (item.thumbnails && item.thumbnails.length > 0)
          ? item.thumbnails[item.thumbnails.length - 1].url
          : `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
        const duration = item.lengthSeconds || 210;

        return {
          id: item.id,
          title: cleaned,
          artist: artist,
          album: 'Fifty Music',
          duration: duration,
          coverUrl: cover,
          accentColor: getAccentColor(cleaned + artist),
          isExplicit: false,
          audioUrl: `/api/stream?id=${item.id}`,
          lyrics: [
            { time: 2, text: `♪ Now playing ${cleaned}` },
            { time: Math.floor(duration * 0.15), text: `♪ By ${artist}` },
            { time: Math.floor(duration * 0.35), text: `♪ High fidelity full-length audio` },
            { time: Math.floor(duration * 0.60), text: `♪ Streaming uninterrupted on Fifty` },
            { time: Math.floor(duration * 0.85), text: `♪ End of track approaching` },
          ]
        };
      });

    searchCache.set(cacheKey, tracks);
    res.json(tracks);
  } catch (err) {
    console.error('Search API error:', err);
    res.status(500).json({ error: 'Search failed', message: err.message });
  }
});

// Resolve full song stream from metadata (artist + title)
app.get('/api/resolve', async (req, res) => {
  const artist = (req.query.artist || '').trim();
  const title = (req.query.title || '').trim();
  const query = `${artist} ${title} audio`.trim();

  if (!query) {
    return res.status(400).json({ error: 'Missing artist or title' });
  }

  const cacheKey = `${artist.toLowerCase()}:::${title.toLowerCase()}`;
  if (resolveCache.has(cacheKey)) {
    return res.json(resolveCache.get(cacheKey));
  }

  try {
    const rawResults = await ytdl.search(query);
    if (!Array.isArray(rawResults) || rawResults.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Pick best match under 10 minutes
    const best = rawResults.find(r => r.lengthSeconds >= 45 && r.lengthSeconds <= 600) || rawResults[0];
    const duration = best.lengthSeconds || 210;

    const resolved = {
      id: best.id,
      title: cleanTitle(best.title),
      artist: best.author?.name || artist,
      duration: duration,
      audioUrl: `/api/stream?id=${best.id}`,
    };

    resolveCache.set(cacheKey, resolved);
    res.json(resolved);
  } catch (err) {
    console.error('Resolve API error:', err);
    res.status(500).json({ error: 'Resolve failed', message: err.message });
  }
});

// Audio Stream with HTTP Range Requests (Full duration playback & seeking)
app.all('/api/stream', async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).send('Missing video id');
  }

  try {
    let format = infoCache.get(id);
    if (!format) {
      const info = await ytdl.getInfo(id);
      format = getBestAudioFormat(info.formats);
      if (!format || !format.url) {
        return res.status(404).send('No audio stream format found');
      }
      infoCache.set(id, format);
    }

    const rangeHeader = req.headers.range;
    const fetchHeaders = {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    };
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    const upstreamRes = await fetch(format.url, { headers: fetchHeaders });

    const status = upstreamRes.status;
    const contentType = upstreamRes.headers.get('content-type') || 'audio/mp4';
    const contentLength = upstreamRes.headers.get('content-length');
    const contentRange = upstreamRes.headers.get('content-range');

    const responseHeaders = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    };

    if (contentLength) responseHeaders['Content-Length'] = contentLength;
    if (contentRange) responseHeaders['Content-Range'] = contentRange;

    res.writeHead(status, responseHeaders);

    if (req.method === 'HEAD') {
      return res.end();
    }

    const { Readable } = await import('stream');
    if (upstreamRes.body) {
      Readable.fromWeb(upstreamRes.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error(`Stream error for id ${id}:`, err.message);
    if (!res.headersSent) {
      res.status(500).send('Stream error: ' + err.message);
    }
  }
});

// Download Fifty.ipa endpoint
app.get('/download/Fifty.ipa', (req, res) => {
  const ipaFile = path.join(__dirname, 'Fifty.ipa');
  res.download(ipaFile, 'Fifty.ipa');
});

// Serve frontend static build
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Client-side routing fallback
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Fifty Music server running on http://localhost:${PORT}`);
  console.log(`Full-length audio streaming active.`);
});
