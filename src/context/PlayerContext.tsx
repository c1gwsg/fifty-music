import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, Playlist, RepeatMode, ToastMessage } from '../types';
import { TRACKS, PLAYLISTS } from '../data/mockData';
import { audioEngine } from '../services/audioEngine';
import { resolveFullTrack, resolveApiUrl } from '../services/musicApi';

interface PlayerContextType {
  currentTrack: Track;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  likedTrackIds: Set<string>;
  likedTracks: Track[];
  playlists: Playlist[];
  activePlaylist: Playlist | null;
  queue: Track[];
  isNowPlayingOpen: boolean;
  isDevicePickerOpen: boolean;
  isQueueOpen: boolean;
  isAddToPlaylistOpen: boolean;
  isVolumeModalOpen: boolean;
  trackForPlaylist: Track | null;
  currentDevice: string;
  volume: number;
  toast: ToastMessage | null;
  downloadedTrackIds: Set<string>;

  playTrack: (track: Track, contextTracks?: Track[], fromPlaylist?: Playlist) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  toggleLike: (track: Track) => void;
  isLiked: (trackId: string) => boolean;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setIsNowPlayingOpen: (open: boolean) => void;
  setIsDevicePickerOpen: (open: boolean) => void;
  setIsQueueOpen: (open: boolean) => void;
  setIsAddToPlaylistOpen: (open: boolean) => void;
  setIsVolumeModalOpen: (open: boolean) => void;
  openAddToPlaylist: (track: Track) => void;
  setCurrentDevice: (dev: string) => void;
  setVolume: (vol: number) => void;
  createPlaylist: (title: string, description?: string) => Playlist;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  downloadTrack: (track: Track) => Promise<void>;
  downloadPlaylist: (playlist: Playlist) => Promise<void>;
  isDownloaded: (trackId: string) => boolean;
  showToast: (text: string, icon?: 'check' | 'download' | 'volume' | 'heart') => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(TRACKS[0]?.duration || 231);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Playlists with persistent LocalStorage support
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('fifty_playlists');
      if (saved) return JSON.parse(saved);
    } catch {}
    return PLAYLISTS;
  });

  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(playlists[1] || PLAYLISTS[1]);
  const [queue, setQueue] = useState<Track[]>(TRACKS);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState<boolean>(false);
  const [isDevicePickerOpen, setIsDevicePickerOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState<boolean>(false);
  const [isVolumeModalOpen, setIsVolumeModalOpen] = useState<boolean>(false);
  const [trackForPlaylist, setTrackForPlaylist] = useState<Track | null>(null);
  const [currentDevice, setCurrentDevice] = useState<string>('iPhone 16 Pro');

  // Independent App Software Volume State (0.0 to 1.0, independent of iOS system volume)
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fifty_app_volume');
      if (saved !== null) return parseFloat(saved);
    } catch {}
    return 0.35; // Default 35% ideal for gaming in background
  });

  // Downloaded Tracks state
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('fifty_downloaded_track_ids');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set<string>();
  });

  // In-app Toast message
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Track map for quick lookup
  const trackMapRef = useRef<Map<string, Track>>(new Map());

  // Liked tracks state
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('fifty_liked_track_ids');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set([TRACKS[0].id, TRACKS[1].id]);
  });

  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('fifty_liked_tracks_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [TRACKS[0], TRACKS[1]];
  });

  // Keep trackMap populated
  useEffect(() => {
    TRACKS.forEach((t) => trackMapRef.current.set(t.id, t));
    likedTracks.forEach((t) => trackMapRef.current.set(t.id, t));
    queue.forEach((t) => trackMapRef.current.set(t.id, t));
    playlists.forEach((p) => p.tracks.forEach((t) => trackMapRef.current.set(t.id, t)));
  }, [likedTracks, queue, playlists]);

  // Persist playlists
  useEffect(() => {
    try {
      localStorage.setItem('fifty_playlists', JSON.stringify(playlists));
    } catch {}
  }, [playlists]);

  // Hook up AudioEngine
  useEffect(() => {
    audioEngine.subscribe(
      (state) => {
        setCurrentTime(state.currentTime);
        if (state.duration && state.duration > 0 && isFinite(state.duration)) {
          setDuration(state.duration);
        }
        setIsPlaying(state.isPlaying);
        setIsBuffering(state.isBuffering);
      },
      () => {
        handleTrackEnd();
      }
    );
  }, [repeatMode, isShuffle, queue, currentTrack]);

  const showToast = (text: string, icon: 'check' | 'download' | 'volume' | 'heart' = 'check') => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({ id: String(Date.now()), text, icon });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 2400);
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one') {
      audioEngine.seek(0);
      audioEngine.play();
    } else {
      nextTrack();
    }
  };

  const playTrack = async (track: Track, contextTracks?: Track[], fromPlaylist?: Playlist) => {
    setCurrentTrack(track);
    setDuration(track.duration || 210);
    trackMapRef.current.set(track.id, track);

    if (contextTracks && contextTracks.length > 0) {
      setQueue(contextTracks);
    }
    if (fromPlaylist) {
      setActivePlaylist(fromPlaylist);
    }

    if (track.audioUrl && track.audioUrl.startsWith('/api/stream')) {
      audioEngine.loadAndPlay(resolveApiUrl(track.audioUrl), track.duration);
      return;
    }

    if (track.artist && track.title) {
      if (track.audioUrl) {
        audioEngine.loadAndPlay(resolveApiUrl(track.audioUrl), track.duration);
      }

      try {
        const resolved = await resolveFullTrack(track.artist, track.title);
        if (resolved && resolved.audioUrl) {
          const updatedTrack: Track = {
            ...track,
            duration: resolved.duration || track.duration,
            audioUrl: resolved.audioUrl,
          };
          setCurrentTrack(updatedTrack);
          setDuration(resolved.duration || track.duration);
          trackMapRef.current.set(track.id, updatedTrack);
          audioEngine.loadAndPlay(resolveApiUrl(resolved.audioUrl), resolved.duration);
        }
      } catch (err) {
        console.warn('Track resolution error:', err);
      }
    } else if (track.audioUrl) {
      audioEngine.loadAndPlay(resolveApiUrl(track.audioUrl), track.duration);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      const currentSrc = audioEngine.getSrc();
      if (!currentSrc || currentSrc === '') {
        playTrack(currentTrack);
        return;
      }
      audioEngine.play();
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    let nextIndex = currentIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        audioEngine.pause();
        setIsPlaying(false);
        setCurrentTime(0);
        return;
      }
    }
    const nextT = queue[nextIndex] || queue[0];
    if (nextT) {
      playTrack(nextT, queue, activePlaylist || undefined);
    }
  };

  const prevTrack = () => {
    if (currentTime > 3) {
      audioEngine.seek(0);
      return;
    }
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
    const prevT = queue[prevIndex] || queue[0];
    if (prevT) {
      playTrack(prevT, queue, activePlaylist || undefined);
    }
  };

  const seek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const toggleLike = (track: Track) => {
    setLikedTrackIds((prevIds) => {
      const nextIds = new Set(prevIds);
      let nextList = [...likedTracks];

      if (nextIds.has(track.id)) {
        nextIds.delete(track.id);
        nextList = nextList.filter((t) => t.id !== track.id);
        showToast(`Removed from Liked Songs`, 'heart');
      } else {
        nextIds.add(track.id);
        nextList.unshift(track);
        showToast(`Added to Liked Songs`, 'heart');
      }

      setLikedTracks(nextList);
      try {
        localStorage.setItem('fifty_liked_track_ids', JSON.stringify(Array.from(nextIds)));
        localStorage.setItem('fifty_liked_tracks_list', JSON.stringify(nextList));
      } catch {}
      return nextIds;
    });
  };

  const isLiked = (trackId: string) => likedTrackIds.has(trackId);

  const toggleShuffle = () => setIsShuffle((prev) => !prev);

  const cycleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  // Independent App Software Volume: Sets gain directly via Web Audio & HTML5 Audio
  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    audioEngine.setVolume(clamped);
  };

  // Playlists Management
  const createPlaylist = (title: string, description = 'Custom playlist on Fifty'): Playlist => {
    const newPl: Playlist = {
      id: `p-${Date.now()}`,
      title,
      description,
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      creator: 'You',
      followers: 'Private',
      isPinned: false,
      accentColor: '#1db954',
      tracks: [],
    };
    setPlaylists((prev) => [newPl, ...prev]);
    showToast(`Created playlist "${title}"`, 'check');
    return newPl;
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    if (playlistId === 'p-liked') {
      toggleLike(track);
      return;
    }

    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        const exists = pl.tracks.some((t) => t.id === track.id);
        if (exists) {
          showToast(`Already in "${pl.title}"`, 'check');
          return pl;
        }
        const updated = {
          ...pl,
          tracks: [...pl.tracks, track],
          coverUrl: pl.tracks.length === 0 ? track.coverUrl : pl.coverUrl,
        };
        showToast(`Added to "${pl.title}"`, 'check');
        return updated;
      })
    );
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return {
          ...pl,
          tracks: pl.tracks.filter((t) => t.id !== trackId),
        };
      })
    );
    showToast('Removed track from playlist', 'check');
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    showToast('Playlist deleted', 'check');
  };

  const openAddToPlaylist = (track: Track) => {
    setTrackForPlaylist(track);
    setIsAddToPlaylistOpen(true);
  };

  // Downloading & Offline Storage
  const isDownloaded = (trackId: string) => downloadedTrackIds.has(trackId);

  const downloadTrack = async (track: Track) => {
    showToast(`Downloading "${track.title}"...`, 'download');
    try {
      const rawUrl = track.audioUrl || `/api/stream?id=${track.id}`;
      const streamUrl = resolveApiUrl(rawUrl);
      const response = await fetch(streamUrl);
      if (!response.ok) throw new Error('Download request failed');

      const blob = await response.blob();

      // Trigger browser file download to local device
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${track.artist} - ${track.title}.m4a`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Cache audio response for offline in-app playback
      if ('caches' in window) {
        try {
          const cache = await caches.open('fifty-audio-cache');
          await cache.put(streamUrl, new Response(blob));
        } catch {}
      }

      setDownloadedTrackIds((prev) => {
        const next = new Set(prev);
        next.add(track.id);
        try {
          localStorage.setItem('fifty_downloaded_track_ids', JSON.stringify(Array.from(next)));
        } catch {}
        return next;
      });

      showToast(`Downloaded "${track.title}"`, 'download');
    } catch (err) {
      console.error('Download failed:', err);
      showToast('Download failed. Please try again.', 'download');
    }
  };

  const downloadPlaylist = async (playlist: Playlist) => {
    if (playlist.tracks.length === 0) {
      showToast('Playlist is empty', 'download');
      return;
    }
    showToast(`Downloading ${playlist.tracks.length} tracks...`, 'download');
    for (const track of playlist.tracks) {
      await downloadTrack(track);
    }
    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlist.id ? { ...p, isDownloaded: true } : p))
    );
    showToast(`Downloaded playlist "${playlist.title}"`, 'download');
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        isShuffle,
        repeatMode,
        likedTrackIds,
        likedTracks,
        playlists,
        activePlaylist,
        queue,
        isNowPlayingOpen,
        isDevicePickerOpen,
        isQueueOpen,
        isAddToPlaylistOpen,
        isVolumeModalOpen,
        trackForPlaylist,
        currentDevice,
        volume,
        toast,
        downloadedTrackIds,

        playTrack,
        togglePlayPause,
        nextTrack,
        prevTrack,
        seek,
        toggleLike,
        isLiked,
        toggleShuffle,
        cycleRepeatMode,
        setIsNowPlayingOpen,
        setIsDevicePickerOpen,
        setIsQueueOpen,
        setIsAddToPlaylistOpen,
        setIsVolumeModalOpen,
        openAddToPlaylist,
        setCurrentDevice,
        setVolume,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        deletePlaylist,
        downloadTrack,
        downloadPlaylist,
        isDownloaded,
        showToast,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
