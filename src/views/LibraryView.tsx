import React, { useState } from 'react';
import { Plus, Search, ArrowUpDown, Pin, Grid, List, Check, X, ArrowDownCircle, CheckCircle2 } from 'lucide-react';
import { Playlist } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface LibraryViewProps {
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onSelectPlaylist }) => {
  const [filter, setFilter] = useState<string>('all');
  const [isGridView, setIsGridView] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');

  const { likedTracks, playlists, createPlaylist, downloadedTrackIds } = usePlayer();

  const filterOptions = ['Playlists', 'Downloaded', 'Podcasts', 'Albums', 'Artists'];

  const likedPlaylist: Playlist = {
    id: 'p-liked',
    title: 'Liked Songs',
    description: 'All your saved favorite tracks in one personal playlist.',
    coverUrl: 'https://misc.scdn.co/liked-songs/liked-songs-640.png',
    creator: 'You',
    followers: 'Private',
    isPinned: true,
    accentColor: '#450af5',
    tracks: likedTracks,
  };

  const rawPlaylists = [likedPlaylist, ...playlists.filter((p) => p.id !== 'p-liked')];

  const allDisplayPlaylists = rawPlaylists.filter((pl) => {
    if (filter === 'all' || filter === 'Playlists') return true;
    if (filter === 'Downloaded') {
      return pl.isDownloaded || pl.tracks.some((t) => downloadedTrackIds.has(t.id));
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistTitle.trim()) {
      const pl = createPlaylist(newPlaylistTitle.trim());
      setNewPlaylistTitle('');
      setIsCreateModalOpen(false);
      onSelectPlaylist(pl);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 pt-4 select-none relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center font-bold text-black text-xs shrink-0 shadow-md">
            L
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Your Library
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 text-white/80 hover:text-[#1db954] transition-colors"
            title="Create Playlist"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-2">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(filter === f ? 'all' : f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-[#1db954] text-black font-bold'
                : 'bg-[#282828] text-white hover:bg-[#333333]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sort & Grid/List Toggle Row */}
      <div className="flex items-center justify-between py-2 text-xs text-[#b3b3b3] font-semibold border-b border-white/5 mb-3">
        <div className="flex items-center gap-1.5">
          <ArrowUpDown size={14} />
          <span>{allDisplayPlaylists.length} playlists</span>
        </div>

        <button
          onClick={() => setIsGridView(!isGridView)}
          className="p-1 hover:text-white transition-colors"
        >
          {isGridView ? <List size={18} /> : <Grid size={18} />}
        </button>
      </div>

      {/* Playlists Display */}
      {allDisplayPlaylists.length === 0 ? (
        <div className="text-center py-16 text-[#b3b3b3]">
          <p className="text-sm font-semibold text-white mb-1">No playlists found</p>
          <p className="text-xs">Create a new playlist by tapping the "+" button at top.</p>
        </div>
      ) : isGridView ? (
        <div className="grid grid-cols-2 gap-4">
          {allDisplayPlaylists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              className="cursor-pointer group flex flex-col"
            >
              <div className="relative mb-2 aspect-square">
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                />
                {pl.isPinned && (
                  <div className="absolute top-2 left-2 bg-black/60 p-1 rounded-full text-[#1db954]">
                    <Pin size={12} className="fill-[#1db954]" />
                  </div>
                )}
                {pl.isDownloaded && (
                  <div className="absolute bottom-2 right-2 bg-black/60 p-1 rounded-full text-[#1db954]">
                    <CheckCircle2 size={13} className="fill-[#1db954]/20" />
                  </div>
                )}
              </div>
              <h4 className="text-sm font-bold text-white truncate leading-tight">
                {pl.title}
              </h4>
              <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                Playlist • {pl.tracks.length} songs
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {allDisplayPlaylists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all"
            >
              <img
                src={pl.coverUrl}
                alt={pl.title}
                className="w-14 h-14 object-cover rounded-md shadow shrink-0"
              />
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate leading-tight">
                  {pl.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-[#b3b3b3] mt-0.5">
                  {pl.isPinned && (
                    <Pin size={11} className="text-[#1db954] fill-[#1db954] shrink-0" />
                  )}
                  {pl.isDownloaded && (
                    <CheckCircle2 size={11} className="text-[#1db954] fill-[#1db954]/20 shrink-0" />
                  )}
                  <span className="truncate">
                    Playlist • {pl.tracks.length} songs • {pl.creator}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {isCreateModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs bg-[#242424] rounded-2xl p-5 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Give your playlist a name</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <input
                type="text"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                placeholder="My Playlist #1"
                className="w-full bg-[#181818] text-white px-3 py-2 rounded-lg text-sm font-semibold border border-white/10 outline-none focus:border-[#1db954] mb-4"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistTitle.trim()}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#1db954] text-black disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
