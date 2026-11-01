import React, { useState } from 'react';
import { X, Plus, Check, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const AddToPlaylistModal: React.FC = () => {
  const {
    isAddToPlaylistOpen,
    setIsAddToPlaylistOpen,
    trackForPlaylist,
    playlists,
    createPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  } = usePlayer();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  if (!isAddToPlaylistOpen || !trackForPlaylist) return null;

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      const pl = createPlaylist(newTitle.trim());
      addTrackToPlaylist(pl.id, trackForPlaylist);
      setNewTitle('');
      setIsCreatingNew(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div
        className="w-full bg-[#1e1e1e] rounded-t-3xl border-t border-white/10 max-h-[85%] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Add to playlist</h3>
          <button
            onClick={() => setIsAddToPlaylistOpen(false)}
            className="p-1 text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selected Track Preview */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border-b border-white/5">
          <img
            src={trackForPlaylist.coverUrl}
            alt={trackForPlaylist.title}
            className="w-11 h-11 rounded-md object-cover shadow shrink-0"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate leading-tight">
              {trackForPlaylist.title}
            </p>
            <p className="text-xs text-[#b3b3b3] truncate mt-0.5 font-medium">
              {trackForPlaylist.artist}
            </p>
          </div>
        </div>

        {/* Content & Playlists List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
          {/* New Playlist Row / Form */}
          {isCreatingNew ? (
            <form onSubmit={handleCreateAndAdd} className="p-3 bg-[#2a2a2a] rounded-xl border border-[#1db954]/50 mb-2">
              <label className="text-xs font-semibold text-white/70 block mb-1.5">
                New playlist name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Chill Gaming Vibes"
                  className="flex-1 bg-[#181818] text-white px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10 outline-none focus:border-[#1db954]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-3 py-1.5 rounded-lg bg-[#1db954] text-black font-bold text-xs disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-2 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#282828] group-hover:bg-[#1db954] flex items-center justify-center text-white group-hover:text-black transition-colors shrink-0">
                <Plus size={22} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold text-white">New playlist</span>
            </button>
          )}

          {/* User & Curated Playlists */}
          <div className="pt-2 space-y-1">
            {playlists.map((pl) => {
              const isInPlaylist = pl.tracks.some((t) => t.id === trackForPlaylist.id);

              return (
                <div
                  key={pl.id}
                  onClick={() => {
                    if (isInPlaylist) {
                      removeTrackFromPlaylist(pl.id, trackForPlaylist.id);
                    } else {
                      addTrackToPlaylist(pl.id, trackForPlaylist);
                    }
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={pl.coverUrl}
                      alt={pl.title}
                      className="w-11 h-11 rounded-md object-cover shrink-0 shadow"
                    />
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-white truncate leading-tight">
                        {pl.title}
                      </p>
                      <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                        {pl.tracks.length} songs • {pl.creator}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isInPlaylist
                          ? 'bg-[#1db954] border-[#1db954] text-black scale-105'
                          : 'border-white/30 text-transparent hover:border-white'
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Done Action */}
        <div className="p-4 border-t border-white/5 bg-[#181818] flex items-center justify-center">
          <button
            onClick={() => setIsAddToPlaylistOpen(false)}
            className="w-full py-2.5 rounded-full bg-white text-black font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
