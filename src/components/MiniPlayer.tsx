import React from 'react';
import { Play, Pause, Heart, Speaker, Loader2, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    togglePlayPause,
    isLiked,
    toggleLike,
    setIsNowPlayingOpen,
    setIsVolumeModalOpen,
    currentDevice,
    volume,
  } = usePlayer();

  const totalDuration = duration > 0 ? duration : 210;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));
  const liked = isLiked(currentTrack.id);
  const volumePercent = Math.round(volume * 100);

  return (
    <div className="px-2 pb-1.5 shrink-0 z-30 select-none">
      <div
        onClick={() => setIsNowPlayingOpen(true)}
        className="relative flex items-center justify-between p-2 rounded-xl bg-[#242424]/95 backdrop-blur-md shadow-xl border border-white/5 cursor-pointer active:scale-[0.99] transition-all overflow-hidden"
      >
        {/* Subtle accent color bleed */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 10% 50%, ${currentTrack.accentColor} 0%, transparent 80%)`,
          }}
        />

        {/* Left: Thumbnail & Meta */}
        <div className="flex items-center gap-3 overflow-hidden pr-2 z-10 flex-1">
          <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 shadow">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            {isPlaying && !isBuffering && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5">
                <span className="w-0.5 h-3 bg-[#1db954] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-4 bg-[#1db954] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-2 bg-[#1db954] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] font-bold text-white truncate leading-tight">
              {currentTrack.title}
            </span>
            <span className="text-[11px] text-[#b3b3b3] truncate leading-tight flex items-center gap-1.5 mt-0.5 font-medium">
              <Speaker size={11} className="text-[#1db954] shrink-0" />
              <span className="truncate">{currentTrack.artist} • {currentDevice}</span>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div
          className="flex items-center gap-1.5 z-10 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Independent Volume Button */}
          <button
            onClick={() => setIsVolumeModalOpen(true)}
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors text-[11px] font-mono font-bold"
            title="App Volume (Independent of iOS)"
          >
            <Volume2 size={15} className="text-[#1db954]" />
            <span>{volumePercent}%</span>
          </button>

          <button
            onClick={() => toggleLike(currentTrack)}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors active:scale-90"
            title="Like track"
          >
            <Heart
              size={18}
              className={liked ? 'text-[#1db954] fill-[#1db954]' : ''}
              strokeWidth={liked ? 2.5 : 2}
            />
          </button>

          <button
            onClick={togglePlayPause}
            className="p-1.5 text-white hover:scale-110 active:scale-90 transition-transform"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : isPlaying ? (
              <Pause size={20} className="fill-white" />
            ) : (
              <Play size={20} className="fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Bottom Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
