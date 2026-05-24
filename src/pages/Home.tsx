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
  category?: string;
  rating?: number;
  isFeatured?: boolean;
  isPremium?: boolean;
  clicks: number;
  videoType?: "redirect" | "video";
  link: string;
  premiumLink?: string;
  videoUrl1080?: string;
  premiumVideoUrl1080?: string;
  videoUrl720?: string;
  premiumVideoUrl720?: string;
  videoUrl480?: string;
  premiumVideoUrl480?: string;
  videoUrl360?: string;
  premiumVideoUrl360?: string;
  videoAspect?: "horizontal" | "vertical";
}

interface HomeProps {
  search?: string;
  setSearch?: (val: string) => void;
}

export default function Home({ search = "", setSearch }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [allAnime, setAllAnime] = useState<Anime[]>([]);

  const categories = ["All", "Indian", "Western", "Russian", "Japnese", "Asian", "Hentai", "Leak/mss"];

  useEffect(() => {
    // Refreshing lists triggered by state transitions gets simulated fast-progress bar integration
    window.dispatchEvent(new CustomEvent("ar_progress_start"));
    const dur = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("ar_progress_end"));
    }, 500);
    return () => clearTimeout(dur);
  }, [selectedCategory, search]);

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
    const isUserPremium = localStorage.getItem("ar_anime_user_premium") === "true";

    if (item.videoType === "video") {
      const videoData = { ...item };
      if (isUserPremium) {
        if (item.premiumVideoUrl1080) videoData.videoUrl1080 = item.premiumVideoUrl1080;
        if (item.premiumVideoUrl720) videoData.videoUrl720 = item.premiumVideoUrl720;
        if (item.premiumVideoUrl480) videoData.videoUrl480 = item.premiumVideoUrl480;
        if (item.premiumVideoUrl360) videoData.videoUrl360 = item.premiumVideoUrl360;
      }
      window.dispatchEvent(new CustomEvent("ar_play_video", { detail: videoData }));
      return;
    }

    try {
      await updateDoc(doc(db, "anime", item.id), {
        clicks: increment(1)
      });
      const targetLink = (isUserPremium && item.premiumLink) ? item.premiumLink : item.link;
      if (targetLink) {
        window.open(targetLink, '_blank');
      }
    } catch (e) {
      console.error(e);
      const targetLink = (isUserPremium && item.premiumLink) ? item.premiumLink : item.link;
      if (targetLink) {
        window.open(targetLink, '_blank');
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
                <Flame strokeWidth={1.2} className="w-5 h-5 text-brand animate-bounce" />
                <h2 className="text-xl font-bold uppercase tracking-tight italic text-white">
                  Trending
                </h2>
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
                  className="w-56 sm:w-64 shrink-0 snap-start group relative aspect-[16/10] bg-bg-dark rounded-2xl overflow-hidden border border-white/[0.08] hover:border-brand/50 shadow-2xl transition-all duration-700 ease-out cursor-pointer focus:outline-none"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  
                  {/* Glass Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-95 flex flex-col justify-end p-4 sm:p-5" />

                  {/* Rank Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-brand rounded-full text-[9px] font-black text-white uppercase tracking-wider border border-white/10 flex items-center gap-1.5 shadow-xl">
                    <Sparkles className="w-3 h-3" />
                    <span>Rank #{index + 1}</span>
                  </div>

                  {/* View counter */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/85 backdrop-blur-md rounded-full text-[9px] font-bold text-white/70 border border-white/5 uppercase tracking-wide flex items-center gap-1.5 shadow-xl">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                    <span>{item.clicks.toLocaleString()} VIEWS</span>
                  </div>

                  {/* Play Action button display on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center shadow-2xl shadow-brand/40 transform scale-75 group-hover:scale-100 transition-all duration-500">
                      <Play strokeWidth={1.2} className="text-white fill-current w-6 h-6 ml-1" />
                    </div>
                  </div>

                  {/* Title and details bottom text */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 shrink-0 pointer-events-none">
                    {item.category && (
                      <span className="text-[7px] font-black tracking-[0.25em] text-brand uppercase mb-1 block">
                        {item.category}
                      </span>
                    )}
                    <h3 className="font-black text-[11px] sm:text-[13px] text-white leading-tight tracking-tight group-hover:text-brand transition-colors uppercase italic line-clamp-1">
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
          <div className="flex items-center gap-4 overflow-x-auto pb-6 custom-scrollbar scroll-smooth no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all border-2 shadow-lg ${
                  selectedCategory === cat 
                  ? 'bg-brand border-brand text-white shadow-brand/40 scale-105'
                  : 'bg-bg-dark/60 backdrop-blur-xl border-white/5 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Subtle Fade Indicators */}
          <div className="absolute right-0 top-0 bottom-6 w-16 bg-gradient-to-l from-bg-darker to-transparent pointer-events-none" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-brand rounded-full shadow-[0_0_25px_rgba(244,117,33,0.7)] animate-pulse" />
              <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white leading-none">
                {selectedCategory === "All" ? "Premium Video" : `${selectedCategory} Collection`}
              </h2>
            </div>
            <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-bold ml-6">High Definition Digital Streaming</p>
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
        <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-white/30"> BLAZE NETWORK | AUTHORIZED ACCESS ONLY</p>
        <p className="text-[9px] text-white/10 font-mono">ENCRYPTED TELEGRAM MINI APP DISTRIBUTION ENGINE</p>
      </div>
    </div>
  );
}
