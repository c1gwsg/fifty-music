import React from 'react';
import { X, Volume2, VolumeX, Volume1, Gamepad2, Sparkles, Check } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const VolumeControlModal: React.FC = () => {
  const { isVolumeModalOpen, setIsVolumeModalOpen, volume, setVolume } = usePlayer();

  if (!isVolumeModalOpen) return null;

  const percent = Math.round(volume * 100);

  const getModeLabel = () => {
    if (percent === 0) return { label: 'Muted', color: 'text-neutral-400' };
    if (percent <= 15) return { label: '🎮 Game Background (Whisper Quiet)', color: 'text-[#1db954]' };
    if (percent <= 35) return { label: '🎧 Low Background Music', color: 'text-emerald-400' };
    if (percent <= 70) return { label: '🎵 Balanced Listening', color: 'text-white' };
    return { label: '🔊 Full Output', color: 'text-amber-400' };
  };

  const mode = getModeLabel();

  const presets = [
    { label: '10% Game BG', val: 0.10, icon: true },
    { label: '25% Low', val: 0.25 },
    { label: '50% Med', val: 0.50 },
    { label: '100% Max', val: 1.0 },
  ];

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200"
      onClick={() => setIsVolumeModalOpen(false)}
    >
      <div
        className="w-full bg-[#1e1e1e] rounded-t-3xl border-t border-white/10 p-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 flex items-center justify-center text-[#1db954]">
              <Volume2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                App Volume Control
              </h3>
              <p className="text-[11px] text-[#1db954] font-semibold">
                Independent of iOS Media Volume
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVolumeModalOpen(false)}
            className="p-1.5 text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Big Volume Percentage Readout */}
        <div className="flex flex-col items-center justify-center py-4 bg-white/5 rounded-2xl mb-5 border border-white/5">
          <span className="text-4xl font-extrabold text-[#1db954] tracking-tight">
            {percent}%
          </span>
          <span className={`text-xs font-bold mt-1 ${mode.color}`}>
            {mode.label}
          </span>
        </div>

        {/* Interactive Slider */}
        <div className="flex items-center gap-3 px-1 mb-6">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.25)}
            className="p-2 text-white/70 hover:text-white transition-colors"
            title={volume === 0 ? 'Unmute' : 'Mute'}
          >
            {volume === 0 ? (
              <VolumeX size={22} className="text-red-400" />
            ) : volume < 0.4 ? (
              <Volume1 size={22} className="text-[#1db954]" />
            ) : (
              <Volume2 size={22} className="text-[#1db954]" />
            )}
          </button>

          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-3 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#1db954]"
            />
          </div>

          <span className="text-xs font-mono font-bold text-white/60 w-8 text-right">
            {percent}%
          </span>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase block mb-2">
            Quick Presets
          </span>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((p) => {
              const isSelected = Math.abs(volume - p.val) < 0.03;
              return (
                <button
                  key={p.label}
                  onClick={() => setVolume(p.val)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-[#1db954] text-black border-[#1db954] shadow-md scale-105'
                      : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gaming Explainer Card */}
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10 flex items-start gap-3">
          <Gamepad2 size={20} className="text-[#1db954] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#b3b3b3] leading-relaxed">
            <strong className="text-white">Playing games with music?</strong> Keep your iPhone system volume high for loud in-game gunshots and footsteps, and set this slider to <span className="text-[#1db954] font-bold">10%-25%</span> for crystal-clear background beats.
          </p>
        </div>

        {/* Done Button */}
        <button
          onClick={() => setIsVolumeModalOpen(false)}
          className="w-full mt-4 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          Done
        </button>
      </div>
    </div>
  );
};
