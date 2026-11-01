import React from 'react';
import { X, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const QueueModal: React.FC = () => {
  const { isQueueOpen, setIsQueueOpen, currentTrack, queue, playTrack } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#181818] rounded-t-3xl p-6 border-t border-white/10 shadow-2xl flex flex-col h-[85%] overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <h2 className="text-base font-bold text-white">Queue</h2>
          <button
            onClick={() => setIsQueueOpen(false)}
            className="p-1 text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-6">
          {/* Now Playing Section */}
          <div>
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
              Now Playing
            </h3>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-[#1db954] truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-white/60 truncate mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>
            </div>
          </div>

          {/* Next Up Section */}
          <div>
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
              Next Up
            </h3>
            <div className="space-y-1">
              {queue
                .filter((t) => t.id !== currentTrack.id)
                .map((track) => (
                  <div
                    key={track.id}
                    onClick={() => {
                      playTrack(track);
                      setIsQueueOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white group-hover:text-[#1db954] transition-colors truncate">
                          {track.title}
                        </p>
                        <p className="text-xs text-white/60 truncate mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <button className="opacity-0 group-hover:opacity-100 p-2 text-white transition-opacity">
                      <Play size={16} className="fill-white" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
