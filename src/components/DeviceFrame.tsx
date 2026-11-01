import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, Maximize2, Minimize2, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { volume, setIsVolumeModalOpen } = usePlayer();
  const volumePercent = Math.round(volume * 100);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On Mobile: Pure 100% Edge-to-Edge native experience (no frames, no fake status bar)
  if (isMobile) {
    return (
      <div className="w-full h-full min-h-dvh h-dvh bg-[#121212] text-white flex flex-col relative overflow-hidden pt-safe pb-safe">
        {children}
      </div>
    );
  }

  // On Desktop: Elegant centered mobile app viewport with optional expand toggle
  return (
    <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Desktop Expand Toggle (Top Right) */}
      <div className="absolute top-4 right-4 z-50 hidden md:flex items-center gap-2">
        <button
          onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
          className="flex items-center gap-1.5 bg-[#1c1c1c]/90 hover:bg-[#282828] active:scale-95 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-neutral-300 shadow-xl transition-all"
          title="Toggle Full Width View on Desktop"
        >
          {isDesktopExpanded ? (
            <>
              <Minimize2 size={13} className="text-[#1db954]" />
              <span>Mobile Column</span>
            </>
          ) : (
            <>
              <Maximize2 size={13} className="text-[#1db954]" />
              <span>Expand View</span>
            </>
          )}
        </button>
      </div>

      {/* Main App Container */}
      <div
        className={`h-full bg-[#121212] text-white flex flex-col relative overflow-hidden transition-all duration-300 ${
          isDesktopExpanded
            ? 'w-full max-w-2xl shadow-2xl border-x border-white/5'
            : 'w-full max-w-[420px] max-h-[92vh] rounded-[32px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]'
        }`}
      >
        {children}
      </div>
    </div>
  );
};
