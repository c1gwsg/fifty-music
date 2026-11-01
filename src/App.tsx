import React, { useState } from 'react';
import { Home, Search, Library, Sparkles, Check, ArrowDownCircle, Heart, Volume2 } from 'lucide-react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { DeviceFrame } from './components/DeviceFrame';
import { MiniPlayer } from './components/MiniPlayer';
import { NowPlayingModal } from './components/NowPlayingModal';
import { DevicePickerModal } from './components/DevicePickerModal';
import { QueueModal } from './components/QueueModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { VolumeControlModal } from './components/VolumeControlModal';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { LibraryView } from './views/LibraryView';
import { PlaylistDetailView } from './views/PlaylistDetailView';
import { NavigationTab, Playlist } from './types';

const FiftyMobileContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const { toast } = usePlayer();

  const handleSelectPlaylist = (pl: Playlist) => {
    setSelectedPlaylist(pl);
  };

  const handleBackToHome = () => {
    setSelectedPlaylist(null);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative bg-[#121212]">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#282828]/95 border border-white/10 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
          {toast.icon === 'download' && <ArrowDownCircle size={15} className="text-[#1db954]" />}
          {toast.icon === 'heart' && <Heart size={15} className="text-[#1db954] fill-[#1db954]" />}
          {toast.icon === 'volume' && <Volume2 size={15} className="text-[#1db954]" />}
          {toast.icon === 'check' && <Check size={15} className="text-[#1db954]" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Active Screen View */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {activeTab === 'home' && (
          selectedPlaylist ? (
            <PlaylistDetailView playlist={selectedPlaylist} onBack={handleBackToHome} />
          ) : (
            <HomeView onSelectPlaylist={handleSelectPlaylist} />
          )
        )}

        {activeTab === 'search' && (
          selectedPlaylist ? (
            <PlaylistDetailView playlist={selectedPlaylist} onBack={handleBackToHome} />
          ) : (
            <SearchView onSelectPlaylist={handleSelectPlaylist} />
          )
        )}

        {activeTab === 'library' && (
          selectedPlaylist ? (
            <PlaylistDetailView playlist={selectedPlaylist} onBack={handleBackToHome} />
          ) : (
            <LibraryView onSelectPlaylist={handleSelectPlaylist} />
          )
        )}
      </div>

      {/* Floating Mini Player */}
      <MiniPlayer />

      {/* Bottom Navigation Tab Bar */}
      <nav className="h-16 shrink-0 bg-[#121212]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-6 z-20 select-none pb-[env(safe-area-inset-bottom,0px)]">
        <button
          onClick={() => {
            setActiveTab('home');
            setSelectedPlaylist(null);
          }}
          className={`flex flex-col items-center justify-center gap-1 w-20 py-1 transition-colors ${
            activeTab === 'home' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('search');
            setSelectedPlaylist(null);
          }}
          className={`flex flex-col items-center justify-center gap-1 w-20 py-1 transition-colors ${
            activeTab === 'search' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Search size={22} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">Search</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('library');
            setSelectedPlaylist(null);
          }}
          className={`flex flex-col items-center justify-center gap-1 w-20 py-1 transition-colors ${
            activeTab === 'library' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Library size={22} strokeWidth={activeTab === 'library' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">Your Library</span>
        </button>
      </nav>

      {/* Modals & Sheets */}
      <NowPlayingModal />
      <DevicePickerModal />
      <QueueModal />
      <AddToPlaylistModal />
      <VolumeControlModal />
    </div>
  );
};

export function App() {
  return (
    <PlayerProvider>
      <DeviceFrame>
        <FiftyMobileContent />
      </DeviceFrame>
    </PlayerProvider>
  );
}

export default App;
