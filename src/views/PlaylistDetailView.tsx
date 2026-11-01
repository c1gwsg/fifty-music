import React, { useState } from 'react';
import {
  ChevronLeft,
  Heart,
  ArrowDownCircle,
  CheckCircle2,
  MoreVertical,
  Play,
  Pause,
  Shuffle,
  ListPlus,
  Trash2,
  Plus,
} from 'lucide-react';
import { Playlist, Track } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  onBack: () => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ playlist, onBack }) => {
  const {
    playTrack,
    currentTrack,
    isPlaying,
    togglePlayPause,
    isShuffle,
    toggleShuffle,
    isLiked,
    toggleLike,
    openAddToPlaylist,
    downloadTrack,
    downloadPlaylist,
    isDownloaded,
    removeTrackFromPlaylist,
  } = usePlayer();

  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);

  const isCurrentPlaylist = playlist.tracks.some((t) => t.id === currentTrack.id);
  const isPlaylistFullyDownloaded =
    playlist.tracks.length > 0 && playlist.tracks.every((t) => isDownloaded(t.id));

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 select-none relative bg-[#121212]">
      {/* Dynamic Header Gradient */}
      <div
        className="relative pt-4 px-4 pb-6 flex flex-col items-center"
        style={{
          background: `linear-gradient(180deg, ${playlist.accentColor} 0%, rgba(18, 18, 18, 0.95) 100%)`,
        }}
      >
        {/* Back Button & Top Options */}
        <div className="w-full flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <div className="w-8" />
        </div>

        {/* Large Cover Image */}
        <div className="w-48 h-48 aspect-square mb-4 shadow-[0_16px_36px_rgba(0,0,0,0.7)] rounded-lg overflow-hidden">
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Playlist Info */}
        <div className="w-full text-left mt-2">
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight mb-1">
            {playlist.title}
          </h1>
          <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-2 font-medium">
            {playlist.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-white/80 font-semibold">
            <span className="text-white font-bold">{playlist.creator}</span>
            <span>•</span>
            <span>{playlist.followers}</span>
            <span>•</span>
            <span>{playlist.tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4 text-white/70">
          <button
            onClick={() => alert(`Saved ${playlist.title} to your library`)}
            className="p-1 hover:text-white transition-colors"
            title="Save playlist"
          >
            <Heart size={22} />
          </button>

          {/* Download Playlist Button */}
          <button
            onClick={() => downloadPlaylist(playlist)}
            className={`p-1 transition-colors ${
              isPlaylistFullyDownloaded ? 'text-[#1db954]' : 'hover:text-white'
            }`}
            title={isPlaylistFullyDownloaded ? 'Downloaded offline' : 'Download entire playlist'}
          >
            {isPlaylistFullyDownloaded ? (
              <CheckCircle2 size={22} className="fill-[#1db954]/20" />
            ) : (
              <ArrowDownCircle size={22} />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${
              isShuffle ? 'text-[#1db954]' : 'text-white/60 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle size={22} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => {
              if (playlist.tracks.length === 0) return;
              if (isCurrentPlaylist && isPlaying) {
                togglePlayPause();
              } else {
                playTrack(playlist.tracks[0], playlist.tracks, playlist);
              }
            }}
            className="w-14 h-14 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {isCurrentPlaylist && isPlaying ? (
              <Pause size={24} className="fill-black" />
            ) : (
              <Play size={24} className="fill-black ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Track List */}
      <div className="px-3 pt-2 space-y-1">
        {playlist.tracks.length === 0 ? (
          <div className="text-center py-12 text-[#b3b3b3]">
            <p className="text-sm font-semibold text-white">This playlist is empty.</p>
            <p className="text-xs mt-1">Search for songs and tap "+" to add them here.</p>
          </div>
        ) : (
          playlist.tracks.map((track, idx) => {
            const isThisTrackPlaying = currentTrack.id === track.id && isPlaying;
            const isThisTrackActive = currentTrack.id === track.id;
            const liked = isLiked(track.id);
            const downloaded = isDownloaded(track.id);
            const isMenuOpen = activeMenuTrackId === track.id;

            return (
              <div
                key={track.id || idx}
                onClick={() => playTrack(track, playlist.tracks, playlist)}
                className="relative flex items-center justify-between p-2 rounded-xl hover:bg-white/5 active:bg-white/10 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5 overflow-hidden flex-1 pr-2">
                  <span
                    className={`w-4 text-xs font-bold text-center ${
                      isThisTrackActive ? 'text-[#1db954]' : 'text-white/40'
                    }`}
                  >
                    {isThisTrackPlaying ? '▶' : idx + 1}
                  </span>

                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-11 h-11 rounded-md object-cover shrink-0"
                  />

                  <div className="overflow-hidden flex-1">
                    <p
                      className={`text-sm font-semibold truncate leading-tight ${
                        isThisTrackActive ? 'text-[#1db954]' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-[#b3b3b3] mt-0.5">
                      {downloaded && (
                        <CheckCircle2 size={11} className="text-[#1db954] fill-[#1db954]/20 shrink-0" />
                      )}
                      {track.isExplicit && (
                        <span className="bg-white/20 text-[9px] font-bold text-white px-1 py-0.2 rounded-sm">
                          E
                        </span>
                      )}
                      <span className="truncate">{track.artist}</span>
                      {track.duration > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] text-[#1db954] font-medium shrink-0">
                            {Math.floor(track.duration / 60)}:
                            {String(Math.floor(track.duration % 60)).padStart(2, '0')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Track Right Action Buttons */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Download Single Track */}
                  <button
                    onClick={() => downloadTrack(track)}
                    className="p-1.5 text-white/50 hover:text-white transition-colors"
                    title={downloaded ? 'Downloaded offline' : 'Download track'}
                  >
                    {downloaded ? (
                      <CheckCircle2 size={17} className="text-[#1db954] fill-[#1db954]/20" />
                    ) : (
                      <ArrowDownCircle size={17} />
                    )}
                  </button>

                  {/* Add to Another Playlist */}
                  <button
                    onClick={() => openAddToPlaylist(track)}
                    className="p-1.5 text-white/50 hover:text-white transition-colors"
                    title="Add to playlist"
                  >
                    <ListPlus size={18} />
                  </button>

                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(track)}
                    className="p-1.5 text-white/50 hover:text-white transition-colors"
                    title="Like track"
                  >
                    <Heart
                      size={18}
                      className={liked ? 'text-[#1db954] fill-[#1db954]' : ''}
                    />
                  </button>

                  {/* Track Menu / Remove Option */}
                  <button
                    onClick={() => setActiveMenuTrackId(isMenuOpen ? null : track.id)}
                    className="p-1.5 text-white/50 hover:text-white transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* Track Options Popover Menu */}
                {isMenuOpen && (
                  <div
                    className="absolute right-2 top-10 z-40 bg-[#282828] border border-white/10 rounded-xl p-1.5 shadow-2xl min-w-[170px] animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        openAddToPlaylist(track);
                        setActiveMenuTrackId(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-white/10 transition-colors text-left"
                    >
                      <ListPlus size={15} />
                      <span>Add to playlist</span>
                    </button>
                    <button
                      onClick={() => {
                        downloadTrack(track);
                        setActiveMenuTrackId(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-white/10 transition-colors text-left"
                    >
                      <ArrowDownCircle size={15} />
                      <span>Download track</span>
                    </button>
                    {playlist.id !== 'p-liked' && (
                      <button
                        onClick={() => {
                          removeTrackFromPlaylist(playlist.id, track.id);
                          setActiveMenuTrackId(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <Trash2 size={15} />
                        <span>Remove from playlist</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
