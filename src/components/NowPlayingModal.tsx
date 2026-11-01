import React, { useState } from 'react';
import {
  ChevronDown,
  MoreVertical,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Share2,
  ListMusic,
  Speaker,
  Volume2,
  VolumeX,
  Volume1,
  Mic2,
  Loader2,
  ArrowDownCircle,
  CheckCircle2,
  ListPlus,
  Gamepad2,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const NowPlayingModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    activePlaylist,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seek,
    toggleLike,
    isLiked,
    toggleShuffle,
    cycleRepeatMode,
    setIsDevicePickerOpen,
    setIsQueueOpen,
    setIsVolumeModalOpen,
    openAddToPlaylist,
    downloadTrack,
    isDownloaded,
    currentDevice,
    volume,
    setVolume,
  } = usePlayer();

  const [isLyricsExpanded, setIsLyricsExpanded] = useState<boolean>(false);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubTime, setScrubTime] = useState<number>(0);

  if (!isNowPlayingOpen) return null;

  const liked = isLiked(currentTrack.id);
  const downloaded = isDownloaded(currentTrack.id);
  const totalDuration = duration > 0 ? duration : 210;
  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent = Math.min(100, Math.max(0, (displayTime / totalDuration) * 100));

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const volumePercent = Math.round(volume * 100);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#121212] overflow-hidden select-none animate-in fade-in slide-in-from-bottom duration-300">
      {/* Dynamic Background Mesh Gradient */}
      <div
        className="absolute inset-0 transition-colors duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${currentTrack.accentColor} 0%, #121212 65%, #000000 100%)`,
          opacity: 0.9,
        }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <button
          onClick={() => setIsNowPlayingOpen(false)}
          className="p-2 -ml-2 text-white/80 hover:text-white active:scale-90 transition-transform"
          title="Minimize player"
        >
          <ChevronDown size={28} />
        </button>

        <div className="flex flex-col items-center max-w-[200px]">
          <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">
            PLAYING FROM PLAYLIST
          </span>
          <span className="text-xs font-bold text-white truncate">
            {activePlaylist ? activePlaylist.title : 'Liked Songs'}
          </span>
        </div>

        <button
          onClick={() => openAddToPlaylist(currentTrack)}
          className="p-2 -mr-2 text-white/80 hover:text-white active:scale-90 transition-transform"
          title="Add to playlist"
        >
          <MoreVertical size={22} />
        </button>
      </div>

      {/* Main Scrollable Body */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 flex flex-col justify-between pb-8">
        {/* Large Album Artwork */}
        <div className="w-full aspect-square my-auto max-h-[310px] flex items-center justify-center">
          <div className="w-full h-full relative rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/5">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Track Info & Quick Actions */}
        <div className="flex items-center justify-between mt-3 mb-2">
          <div className="overflow-hidden pr-3 flex-1">
            <h2 className="text-xl font-bold text-white leading-tight truncate">
              {currentTrack.title}
            </h2>
            <p className="text-sm font-medium text-white/70 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download Button */}
            <button
              onClick={() => downloadTrack(currentTrack)}
              className="p-2 text-white/70 hover:text-white active:scale-90 transition-transform"
              title={downloaded ? 'Downloaded offline' : 'Download track'}
            >
              {downloaded ? (
                <CheckCircle2 size={23} className="text-[#1db954] fill-[#1db954]/20" />
              ) : (
                <ArrowDownCircle size={23} />
              )}
            </button>

            {/* Add to Playlist Button */}
            <button
              onClick={() => openAddToPlaylist(currentTrack)}
              className="p-2 text-white/70 hover:text-white active:scale-90 transition-transform"
              title="Add to playlist"
            >
              <ListPlus size={24} />
            </button>

            {/* Like Button */}
            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-2 text-white/70 hover:text-white active:scale-90 transition-transform"
              title="Like song"
            >
              <Heart
                size={24}
                className={liked ? 'text-[#1db954] fill-[#1db954]' : ''}
                strokeWidth={liked ? 2.5 : 2}
              />
            </button>
          </div>
        </div>

        {/* Fifty Dynamic Scrubber Bar */}
        <div className="w-full py-1">
          <div
            className="relative flex items-center h-8 cursor-pointer touch-none select-none group"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const target = ratio * totalDuration;
              setIsScrubbing(true);
              setScrubTime(target);
            }}
            onPointerMove={(e) => {
              if (!isScrubbing) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const target = ratio * totalDuration;
              setScrubTime(target);
            }}
            onPointerUp={(e) => {
              if (isScrubbing) {
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                } catch {}
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const target = ratio * totalDuration;
                setIsScrubbing(false);
                seek(target);
              }
            }}
            onPointerCancel={() => {
              setIsScrubbing(false);
            }}
          >
            {/* Background Track */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              {/* Progress Fill */}
              <div
                className="h-full bg-white rounded-full transition-[width] duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Scrubber Thumb Dot */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg transition-transform ${
                isScrubbing ? 'scale-125' : 'scale-100 group-hover:scale-125'
              }`}
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Timestamps */}
          <div className="flex justify-between text-[11px] text-white/60 font-semibold -mt-1 select-none">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Primary Playback Transport Controls */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors relative ${
              isShuffle ? 'text-[#1db954]' : 'text-white/60 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle size={20} strokeWidth={2.5} />
            {isShuffle && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1db954] rounded-full" />
            )}
          </button>

          <button
            onClick={prevTrack}
            className="p-2 text-white hover:scale-110 active:scale-90 transition-transform"
            title="Previous"
          >
            <SkipBack size={28} className="fill-white" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <Loader2 size={28} className="animate-spin text-black" />
            ) : isPlaying ? (
              <Pause size={28} className="fill-black" />
            ) : (
              <Play size={28} className="fill-black ml-1" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-2 text-white hover:scale-110 active:scale-90 transition-transform"
            title="Next"
          >
            <SkipForward size={28} className="fill-white" />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`p-2 transition-colors relative ${
              repeatMode !== 'off' ? 'text-[#1db954]' : 'text-white/60 hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 size={20} strokeWidth={2.5} />
            ) : (
              <Repeat size={20} strokeWidth={2.5} />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1db954] rounded-full" />
            )}
          </button>
        </div>

        {/* Independent Built-In App Volume Slider (Completely Independent of iOS Media Volume) */}
        <div className="bg-black/40 rounded-2xl p-3 my-2 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Gamepad2 size={15} className="text-[#1db954]" />
              <span className="text-[11px] font-bold text-white tracking-wide uppercase">
                App Volume (Game BG)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#1db954]">
                {volumePercent}%
              </span>
              <button
                onClick={() => setIsVolumeModalOpen(true)}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-white/90 px-2 py-0.5 rounded-full font-semibold transition-colors"
              >
                Presets
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.25)}
              className="text-white/70 hover:text-white"
            >
              {volume === 0 ? (
                <VolumeX size={17} className="text-red-400" />
              ) : volume < 0.4 ? (
                <Volume1 size={17} className="text-[#1db954]" />
              ) : (
                <Volume2 size={17} className="text-[#1db954]" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#1db954]"
            />

            {/* Quick 15% Game BG Button */}
            <button
              onClick={() => setVolume(0.15)}
              className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 border transition-all ${
                Math.abs(volume - 0.15) < 0.04
                  ? 'bg-[#1db954] text-black border-[#1db954]'
                  : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
              }`}
              title="Set to 15% whisper quiet for background gaming"
            >
              15% BG
            </button>
          </div>
        </div>

        {/* Bottom Accessories Bar */}
        <div className="flex items-center justify-between text-white/70 pt-1 pb-1">
          <button
            onClick={() => setIsDevicePickerOpen(true)}
            className="flex items-center gap-2 hover:text-white transition-colors text-xs font-semibold"
          >
            <Speaker size={18} className="text-[#1db954]" />
            <span className="text-[#1db954] font-medium">{currentDevice}</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsVolumeModalOpen(true)}
              className="p-1 hover:text-[#1db954] text-white/80 transition-colors"
              title="Independent Volume Menu"
            >
              <Volume2 size={18} />
            </button>
            <button
              onClick={() => alert(`Shared link to ${currentTrack.title}`)}
              className="p-1 hover:text-white transition-colors"
              title="Share"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => setIsQueueOpen(true)}
              className="p-1 hover:text-white transition-colors"
              title="Queue"
            >
              <ListMusic size={20} />
            </button>
          </div>
        </div>

        {/* Live Synchronized Lyrics Card */}
        {currentTrack.lyrics && (
          <div
            onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
            className="mt-3 rounded-2xl p-4 cursor-pointer transition-all duration-300 relative overflow-hidden"
            style={{
              backgroundColor: `${currentTrack.accentColor}cc`,
            }}
          >
            <div className="flex items-center justify-between mb-2 text-white font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <Mic2 size={14} />
                LYRICS
              </span>
              <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full">
                {isLyricsExpanded ? 'Collapse' : 'Tap to expand'}
              </span>
            </div>

            <div className={`space-y-2 text-sm font-semibold transition-all ${isLyricsExpanded ? 'max-h-64 overflow-y-auto no-scrollbar' : 'max-h-20 overflow-hidden'}`}>
              {currentTrack.lyrics.map((line, idx) => {
                const isCurrent = currentTime >= line.time && (idx === currentTrack.lyrics!.length - 1 || currentTime < currentTrack.lyrics![idx + 1].time);
                return (
                  <p
                    key={idx}
                    className={`transition-colors duration-300 ${
                      isCurrent
                        ? 'text-white text-base font-extrabold scale-[1.01]'
                        : 'text-white/40'
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
