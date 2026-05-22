import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "motion/react";
import BannerCarousel from "../components/BannerCarousel";
import AnimeGrid from "../components/AnimeGrid";
import { Search, Star, Play, Eye, Sparkles, Clock, Flame } from "lucide-react";

interface Anime {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
  category?: string;
  rating?: number;
  isFeatured?: boolean;
  clicks: number;
  videoType?: "redirect" | "video";
  videoUrl1080?: string;
  videoUrl720?: string;
  videoUrl480?: string;
  videoUrl360?: string;
  videoAspect?: "horizontal" | "vertical";
}

interface HomeProps {
  search?: string;
  setSearch?: (val: string) => void;
}

export default function Home({ search = "", setSearch }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [allAnime, setAllAnime] = useState<Anime[]>([]);

  const categories = ["All", "Action", "Comedy", "Drama", "Fantasy", "Romance", "Sci-Fi", "Slice of Life", "Adventure", "Supernatural"];

  useEffect(() => {
    const q = query(collection(db, "anime"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const all: Anime[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime));
      setAllAnime(all);
    });
  }, []);

  const trendingAnime = [...allAnime].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  const topTrending = trendingAnime.slice(0, 15);

  const handleLinkClick = async (item: Anime) => {
    if (item.videoType === "video") {
      window.dispatchEvent(new CustomEvent("ar_play_video", { detail: item }));
      return;
    }

    try {
      await updateDoc(doc(db, "anime", item.id), {
        clicks: increment(1)
      });
      if (item.link) {
        window.open(item.link, '_blank');
      }
    } catch (e) {
      console.error(e);
      if (item.link) {
        window.open(item.link, '_blank');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Banner Promos */}
      <BannerCarousel />
      
      <div className="max-w-7xl mx-auto w-full px-4 space-y-10">

        {/* Dynamic Horizontal Scroll Spotlight Section (Clicks Trending) */}
        {topTrending.length > 0 && (
          <div id="trending-scroll-section" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-brand animate-bounce" />
                <h2 className="text-xl font-bold uppercase tracking-tight italic text-white">
                  Trending Updates
                </h2>
                <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-black uppercase tracking-wider font-mono">Real-time ranking active</span>
              </div>
            </div>

            {/* Horizontal Scroll Containers */}
            <div 
              id="trending-row-container" 
              className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar custom-scrollbar scroll-smooth"
            >
              {topTrending.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleLinkClick(item)}
                  className="w-48 sm:w-52 shrink-0 snap-start group relative aspect-video bg-bg-dark rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 hover:border-brand/50 shadow-xl transition-all duration-300 cursor-pointer focus:outline-none"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Glass Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-95 flex flex-col justify-end p-2.5 sm:p-3" />

                  {/* Rank Badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-brand rounded text-[8px] font-black text-white uppercase tracking-wider border border-white/10 flex items-center gap-0.5 shadow-lg">
                    <span>Rank #{index + 1}</span>
                  </div>

                  {/* View counter */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/85 backdrop-blur-md rounded text-[7px] font-black text-white/70 border border-white/5 uppercase tracking-wide flex items-center gap-0.5">
                    <div className="w-1 h-1 bg-brand rounded-full animate-pulse" />
                    <span>{item.clicks.toLocaleString()}</span>
                  </div>

                  {/* Play Action button display on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Play className="text-white fill-current w-4 h-4 ml-0.5" />
                    </div>
                  </div>

                  {/* Title and details bottom text */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 shrink-0 pointer-events-none">
                    {item.category && (
                      <span className="text-[7px] font-black tracking-widest text-brand uppercase mb-0.5 block">
                        {item.category}
                      </span>
                    )}
                    <h3 className="font-extrabold text-[10px] sm:text-[11px] text-white line-clamp-1 leading-tight tracking-tight group-hover:text-brand transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modern Categories Bar */}
        <div className="relative pt-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar scroll-smooth no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-7 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all border shadow-sm ${
                  selectedCategory === cat 
                  ? 'bg-brand border-brand text-white shadow-brand/40 scale-105' 
                  : 'bg-bg-dark/40 backdrop-blur-md border-white/5 text-white/30 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Subtle Fade Indicators */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-bg-darker to-transparent pointer-events-none" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-brand rounded-full shadow-[0_0_15px_rgba(244,117,33,0.5)]" />
              <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white/95">
                {selectedCategory === "All" ? "Premium Series" : `${selectedCategory} Collection`}
              </h2>
            </div>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] ml-5">Exploration / Database / v2.0</p>
          </div>
        </div>
        
        {/* Main Grid Component (normal latest list) */}
        <AnimeGrid search={search} category={selectedCategory} sortBy="latest" />
      </div>

      {/* Footer Info / SEO Stuff */}
      <div className="max-w-7xl mx-auto w-full px-4 mt-20 border-t border-white/5 pt-12 text-center">
        <div className="flex justify-center gap-6 mb-4 opacity-20">
           <div className="h-0.5 w-12 bg-brand" />
           <div className="h-0.5 w-12 bg-white" />
           <div className="h-0.5 w-12 bg-brand" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-white/30">AR ANIME NETWORK | AUTHORIZED ACCESS ONLY</p>
        <p className="text-[9px] text-white/10 font-mono">ENCRYPTED TELEGRAM MINI APP DISTRIBUTION ENGINE</p>
      </div>
    </div>
  );
}
