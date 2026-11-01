export type NavigationTab = 'home' | 'search' | 'library';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  accentColor: string; // Hex color for player gradient
  isExplicit?: boolean;
  audioUrl?: string; // Optional real URL, synthesized fallback if absent
  lyrics?: { time: number; text: string }[];
  isDownloaded?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  creator: string;
  followers: string;
  isPinned?: boolean;
  tracks: Track[];
  accentColor: string;
  isDownloaded?: boolean;
}

export interface CategoryCard {
  id: string;
  title: string;
  color: string;
  imageUrl: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface ToastMessage {
  id: string;
  text: string;
  icon?: 'check' | 'download' | 'volume' | 'heart';
}
