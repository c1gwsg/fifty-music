import React, { useState, useEffect } from 'react';
import {
  Search as SearchIcon,
  X,
  Play,
  Heart,
  Loader2,
  ListPlus,
  ArrowDownCircle,
  CheckCircle2,
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { Playlist, Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { searchMusic, fetchCategoryTracks } from '../services/musicApi';

interface SearchViewProps {
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onSelectPlaylist }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState<string | null>(null);

  const {
    playTrack,
    currentTrack,
    isPlaying,
    isLiked,
    toggleLike,
    openAddToPlaylist,
    downloadTrack,
    isDownloaded,
  } = usePlayer();

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const results = await searchMusic(searchQuery, 35);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleCategoryClick = async (categoryTitle: string, color: string) => {
    setCategoryLoading(categoryTitle);
    try {
      const tracks = await fetchCategoryTracks(categoryTitle, 25);
      const categoryPlaylist: Playlist = {
        id: `cat-${categoryTitle.toLowerCase().replace(/\s+/g, '-')}`,
        title: `${categoryTitle} Hits`,
        description: `Top trending and popular ${categoryTitle} tracks streaming on Fifty.`,
        coverUrl:
          tracks[0]?.coverUrl ||
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        creator: 'Fifty Editorial',
        followers: '2,450,100 saves',
        isPinned: false,
        accentColor: color,
        tracks: tracks,
      };
      onSelectPlaylist(categoryPlaylist);
    } catch (err) {
      console.error('Failed to load category:', err);
    } finally {
      setCategoryLoading(null);
    }
  };

  const topResult = searchResults[0];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 pt-4 select-none">
      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">
        Search
      </h2>

      {/* Search Input Bar */}
      <div className="relative flex items-center bg-white rounded-lg px-3 py-2.5 mb-5 text-black shadow-lg">
        <SearchIcon size={20} className="text-neutral-600 mr-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full bg-transparent text-black text-sm font-semibold outline-none placeholder:text-neutral-500 placeholder:font-normal"
          autoFocus={false}
        />
        {isSearching && (
          <Loader2 size={18} className="animate-spin text-neutral-500 mr-1" />
        )}
        {searchQuery && !isSearching && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
            className="p-1 text-neutral-500 hover:text-black transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {searchQuery.trim() ? (
        // Live Search Results
        <div className="space-y-6">
          {isSearching && searchResults.length === 0 ? (
            <div className="text-center py-16 text-[#b3b3b3]">
              <Loader2 size={32} className="animate-spin mx-auto mb-3 text-[#1db954]" />
              <p className="text-sm font-medium">Searching worldwide catalog...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              {/* Top Result Card */}
              {topResult && (
                <div>
                  <h3 className="text-base font-bold text-white mb-2">Top result</h3>
                  <div
                    onClick={() => playTrack(topResult, searchResults)}
                    className="p-4 rounded-xl bg-[#242424] hover:bg-[#2c2c2c] transition-colors cursor-pointer group relative flex flex-col items-start shadow-md"
                  >
                    <img
                      src={topResult.coverUrl}
                      alt={topResult.title}
                      className="w-20 h-20 rounded-lg object-cover mb-3 shadow-lg"
                    />
                    <h4 className="text-xl font-extrabold text-white leading-tight">
                      {topResult.title}
                    </h4>
                    <p className="text-xs text-[#b3b3b3] mt-1 flex items-center gap-1.5">
                      <span>Song</span>
                      <span>•</span>
                      <span className="text-white font-semibold">{topResult.artist}</span>
                      {topResult.duration > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[#1db954] font-bold">
                            {Math.floor(topResult.duration / 60)}:
                            {String(Math.floor(topResult.duration % 60)).padStart(2, '0')}
                          </span>
                        </>
                      )}
                    </p>
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddToPlaylist(topResult);
                        }}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                        title="Add to playlist"
                      >
                        <ListPlus size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(topResult, searchResults);
                        }}
                        className="w-12 h-12 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                      >
                        <Play size={20} className="fill-black ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Songs List */}
              <div>
                <h3 className="text-base font-bold text-white mb-2">Songs</h3>
                <div className="space-y-1">
                  {searchResults.slice(0, 25).map((track, idx) => {
                    const isThisPlaying = currentTrack.id === track.id && isPlaying;
                    const isThisActive = currentTrack.id === track.id;
                    const liked = isLiked(track.id);
                    const downloaded = isDownloaded(track.id);

                    return (
                      <div
                        key={track.id || idx}
                        onClick={() => playTrack(track, searchResults)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 active:bg-white/10 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3 overflow-hidden flex-1 pr-2">
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-12 h-12 rounded-md object-cover shrink-0"
                          />
                          <div className="overflow-hidden flex-1">
                            <p
                              className={`text-sm font-semibold truncate leading-tight ${
                                isThisActive ? 'text-[#1db954]' : 'text-white'
                              }`}
                            >
                              {track.title}
                            </p>
                            <p className="text-xs text-[#b3b3b3] truncate mt-0.5 flex items-center gap-1.5">
                              {downloaded && (
                                <CheckCircle2 size={11} className="text-[#1db954] fill-[#1db954]/20 shrink-0" />
                              )}
                              <span>{track.artist}</span>
                              {track.duration > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-[11px] text-[#1db954] font-medium">
                                    {Math.floor(track.duration / 60)}:
                                    {String(Math.floor(track.duration % 60)).padStart(2, '0')}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => downloadTrack(track)}
                            className="p-1.5 text-white/50 hover:text-white transition-colors"
                            title={downloaded ? 'Downloaded' : 'Download song'}
                          >
                            {downloaded ? (
                              <CheckCircle2 size={16} className="text-[#1db954] fill-[#1db954]/20" />
                            ) : (
                              <ArrowDownCircle size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => openAddToPlaylist(track)}
                            className="p-1.5 text-white/50 hover:text-white transition-colors"
                            title="Add to playlist"
                          >
                            <ListPlus size={17} />
                          </button>
                          <button
                            onClick={() => toggleLike(track)}
                            className="p-1.5 text-white/50 hover:text-white transition-colors"
                            title="Like track"
                          >
                            <Heart
                              size={17}
                              className={liked ? 'text-[#1db954] fill-[#1db954]' : ''}
                            />
                          </button>
                          <button
                            onClick={() => playTrack(track, searchResults)}
                            className="p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play
                              size={16}
                              className={
                                isThisPlaying ? 'fill-[#1db954] text-[#1db954]' : 'fill-white'
                              }
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-[#b3b3b3]">
              <p className="text-base font-bold text-white mb-1">No songs found</p>
              <p className="text-xs">Try searching for a different song, artist, or band name.</p>
            </div>
          )}
        </div>
      ) : (
        // Browse Categories Grid
        <div>
          <h3 className="text-base font-bold text-white mb-3">Browse all</h3>
          <div className="grid grid-cols-2 gap-3 pb-8">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.title, cat.color)}
                className="relative h-24 rounded-lg p-3 overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md flex justify-between"
                style={{ backgroundColor: cat.color }}
              >
                <span className="text-base font-bold text-white leading-tight max-w-[90px]">
                  {cat.title}
                </span>

                <img
                  src={cat.imageUrl}
                  alt={cat.title}
                  className="absolute -right-3 -bottom-2 w-16 h-16 object-cover rounded-md rotate-[25deg] shadow-lg pointer-events-none"
                />

                {categoryLoading === cat.title && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
