import React, { useState } from 'react';
import { Play, Volume2, ArrowDownCircle } from 'lucide-react';
import { TRACKS, PLAYLISTS } from '../data/mockData';
import { Playlist, Track } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface HomeViewProps {
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectPlaylist }) => {
  const { playTrack, currentTrack, isPlaying, playlists, likedTracks, volume, setIsVolumeModalOpen } = usePlayer();
  const volumePercent = Math.round(volume * 100);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const likedPlaylist: Playlist = {
    id: 'p-liked',
    title: 'Liked Songs',
    description: 'Your favorite tracks in one playlist.',
    coverUrl: 'https://misc.scdn.co/liked-songs/liked-songs-640.png',
    creator: 'You',
    followers: 'Private',
    isPinned: true,
    accentColor: '#450af5',
    tracks: likedTracks,
  };

  const quickAccessItems = [
    { type: 'liked', title: 'Liked Songs', coverUrl: 'https://misc.scdn.co/liked-songs/liked-songs-640.png', playlist: likedPlaylist },
    { type: 'playlist', title: "Today's Top Hits", coverUrl: playlists[1]?.coverUrl || TRACKS[0].coverUrl, playlist: playlists[1] },
    { type: 'playlist', title: 'RapCaviar', coverUrl: playlists[2]?.coverUrl || TRACKS[2].coverUrl, playlist: playlists[2] },
    { type: 'track', title: TRACKS[0].title, coverUrl: TRACKS[0].coverUrl, track: TRACKS[0] },
    { type: 'playlist', title: 'Rock Classics', coverUrl: playlists[3]?.coverUrl || TRACKS[4].coverUrl, playlist: playlists[3] },
    { type: 'track', title: TRACKS[1].title, coverUrl: TRACKS[1].coverUrl, track: TRACKS[1] },
  ];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-gradient-to-b from-[#2a1a45]/40 via-[#121212] to-[#121212] px-4 pt-3 select-none">
      {/* Top Header with Profile, Volume & IPA download */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center font-bold text-black text-xs shrink-0 shadow-md">
            L
          </div>
          <span className="text-sm font-bold text-white tracking-wide">Fifty</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Independent Game BG Volume Button */}
          <button
            onClick={() => setIsVolumeModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#242424] hover:bg-[#333333] active:scale-95 px-2.5 py-1.5 rounded-full text-xs text-white border border-white/5 transition-all shadow"
            title="Independent Game BG Volume"
          >
            <Volume2 size={13} className="text-[#1db954]" />
            <span className="font-mono text-[#1db954] font-bold text-[11px]">{volumePercent}%</span>
          </button>

          {/* Download IPA button */}
          <a
            href="/download/Fifty.ipa"
            download="Fifty.ipa"
            className="flex items-center gap-1 bg-[#242424] hover:bg-[#333333] active:scale-95 px-2.5 py-1.5 rounded-full text-xs text-neutral-300 border border-white/5 transition-all shadow"
            title="Download Fifty.ipa for Sideloadly / AltStore / TrollStore"
          >
            <ArrowDownCircle size={13} className="text-[#1db954]" />
            <span className="text-[11px] font-semibold">.IPA</span>
          </a>
        </div>
      </div>

      {/* Greeting Title */}
      <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
        {getGreeting()}
      </h2>

      {/* 6-Grid Quick Access Cards */}
      <div className="grid grid-cols-2 gap-2 mb-7">
        {quickAccessItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              if (item.playlist) onSelectPlaylist(item.playlist);
              else if (item.track) playTrack(item.track, TRACKS);
            }}
            className="flex items-center gap-3 bg-[#242424]/90 hover:bg-[#303030] active:scale-[0.98] transition-all rounded-md overflow-hidden cursor-pointer group shadow-sm"
          >
            <img
              src={item.coverUrl}
              alt={item.title}
              className="w-14 h-14 object-cover shrink-0"
            />
            <span className="text-xs font-bold text-white truncate pr-2 flex-1 leading-tight">
              {item.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (item.playlist && item.playlist.tracks.length > 0) {
                  playTrack(item.playlist.tracks[0], item.playlist.tracks, item.playlist);
                } else if (item.track) {
                  playTrack(item.track, TRACKS);
                }
              }}
              className="w-8 h-8 rounded-full bg-[#1db954] text-black flex items-center justify-center mr-2 shadow-md opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <Play size={14} className="fill-black ml-0.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Carousel 1: Made For You */}
      <div className="mb-7">
        <h3 className="text-lg font-bold text-white mb-3 tracking-tight">
          Made For You
        </h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              className="w-36 shrink-0 cursor-pointer group"
            >
              <div className="relative mb-2">
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-36 h-36 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pl.tracks.length > 0) {
                      playTrack(pl.tracks[0], pl.tracks, pl);
                    }
                  }}
                  className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all"
                >
                  <Play size={16} className="fill-black ml-0.5" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-white truncate leading-tight">
                {pl.title}
              </h4>
              <p className="text-[11px] text-[#b3b3b3] line-clamp-2 mt-0.5 leading-snug">
                {pl.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel 2: Jump Back In */}
      <div className="mb-7">
        <h3 className="text-lg font-bold text-white mb-3 tracking-tight">
          Jump Back In
        </h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {TRACKS.map((t) => {
            const isThisPlaying = currentTrack.id === t.id && isPlaying;
            return (
              <div
                key={t.id}
                onClick={() => playTrack(t, TRACKS)}
                className="w-32 shrink-0 cursor-pointer group"
              >
                <div className="relative mb-2">
                  <img
                    src={t.coverUrl}
                    alt={t.title}
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                  <div
                    className={`absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-xl transition-all ${
                      isThisPlaying ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Play size={14} className="fill-black ml-0.5" />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-white truncate">
                  {t.title}
                </h4>
                <p className="text-[11px] text-[#b3b3b3] truncate mt-0.5">
                  {t.artist}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
