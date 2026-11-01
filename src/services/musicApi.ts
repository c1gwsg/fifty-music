import { Track } from '../types';

// Palette of dynamic Fifty dark gradients
const ACCENT_COLORS = [
  '#1db954', // Emerald Vibrant
  '#931a25', // Deep Red
  '#b82619', // Crimson
  '#2b3a67', // Midnight Blue
  '#1e5f74', // Teal Blue
  '#7a1f1d', // Dark Maroon
  '#96701a', // Gold/Amber
  '#532e82', // Royal Purple
  '#e8115b', // Hot Pink
  '#006450', // Emerald Dark
  '#ba5d07', // Orange/Brown
  '#1f2421', // Dark Slate
];

function getAccentColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % ACCENT_COLORS.length;
  return ACCENT_COLORS[index];
}

interface ITunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  trackTimeMillis?: number;
  previewUrl: string;
  artworkUrl100?: string;
}

export function formatITunesTrack(item: ITunesResult): Track {
  const highResArt = item.artworkUrl100
    ? item.artworkUrl100.replace('100x100bb', '600x600bb')
    : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

  const title = item.trackName || 'Unknown Title';
  const artist = item.artistName || 'Unknown Artist';
  const fullDuration = item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210;

  return {
    id: String(item.trackId || Math.random()),
    title: title,
    artist: artist,
    album: item.collectionName || title,
    duration: fullDuration,
    coverUrl: highResArt,
    accentColor: getAccentColor(title + artist),
    isExplicit: false,
    audioUrl: item.previewUrl,
    lyrics: [
      { time: 2, text: `♪ Listening to ${title}` },
      { time: Math.floor(fullDuration * 0.15), text: `♪ By ${artist}` },
      { time: Math.floor(fullDuration * 0.35), text: '♪ Full-length streaming on Fifty' },
      { time: Math.floor(fullDuration * 0.65), text: '♪ High-fidelity mobile audio' },
    ],
  };
}

// API Server resolution for native iOS and browser environments
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // When loaded over HTTP or HTTPS (localhost, local IP, or public HTTPS Cloudflare domain),
    // always use relative paths so requests stay on the same origin and avoid mixed-content blocks.
    if (window.location.protocol.startsWith('http')) {
      return '';
    }
    // Only when running inside native standalone iOS shell (capacitor:// or file://)
    const saved = localStorage.getItem('fifty_server_host');
    if (saved) return saved.replace(/\/$/, '');
    return 'https://las-remarks-accompanied-adaptive.trycloudflare.com';
  }
  return '';
}

export function resolveApiUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const base = getApiBaseUrl();
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
}

// Search full-length tracks
export async function searchMusic(query: string, limit = 30): Promise<Track[]> {
  if (!query || !query.trim()) return [];

  // Try Fifty Full-Length Music Engine first
  try {
    const res = await fetch(resolveApiUrl(`/api/search?q=${encodeURIComponent(query.trim())}`));
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        return items.slice(0, limit);
      }
    }
  } catch {
    // fallback to iTunes if api is unreachable
  }

  // Fallback to iTunes API with full track length metadata
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&entity=song&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    return (data.results || [])
      .filter((r: ITunesResult) => Boolean(r.previewUrl || r.trackName))
      .map(formatITunesTrack);
  } catch (error) {
    console.error('Failed to search music:', error);
    return [];
  }
}

// Fetch tracks for category playlists
export async function fetchCategoryTracks(genreName: string, limit = 20): Promise<Track[]> {
  try {
    const res = await fetch(resolveApiUrl(`/api/search?q=${encodeURIComponent(genreName + ' hits audio')}`));
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        return items.slice(0, limit);
      }
    }
  } catch {}

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(genreName + ' hits')}&entity=song&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || [])
      .filter((r: ITunesResult) => Boolean(r.previewUrl))
      .map(formatITunesTrack);
  } catch {
    return [];
  }
}

// Resolve full-length stream for any track
export async function resolveFullTrack(artist: string, title: string): Promise<{
  id: string;
  duration: number;
  audioUrl: string;
  title: string;
} | null> {
  try {
    const res = await fetch(resolveApiUrl(`/api/resolve?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`));
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Resolve track failed:', err);
  }
  return null;
}
