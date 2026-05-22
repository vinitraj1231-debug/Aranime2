import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "motion/react";
import BannerCarousel from "../components/BannerCarousel";
import AnimeGrid from "../components/AnimeGrid";
import { Search, Star, Play, Eye, Sparkles } from "lucide-react";

interface Anime {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
  category?: string;
  rating?: number;
  isFeatured?: boolean;
  clicks: number;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);

  const categories = ["All", "Action", "Comedy", "Drama", "Fantasy", "Romance", "Sci-Fi", "Slice of Life", "Adventure", "Supernatural"];

  useEffect(() => {
    const q = query(collection(db, "anime"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const all: Anime[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime));
      // Filter out specifically the ones marked as isFeatured
      setFeaturedAnime(all.filter(item => item.isFeatured === true));
    });
  }, []);

  const handleLinkClick = async (id: string, link: string) => {
    try {
      await updateDoc(doc(db, "anime", id), {
        clicks: increment(1)
      });
      window.open(link, '_blank');
    } catch (e) {
      console.error(e);
      window.open(link, '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Banner Promos */}
      <BannerCarousel />
      
      <div className="max-w-7xl mx-auto w-full px-4 space-y-10">

        {/* Dynamic Horizontal Scroll Spotlight Section (Admin Controlled) */}
        {featuredAnime.length > 0 && (
          <div id="featured-scroll-section" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand animate-pulse" />
                <h2 className="text-xl font-bold uppercase tracking-tight italic text-white">
                  Featured Spotlights
                </h2>
                <span className="text-[9px] bg-brand/10 text-brand px-2 py-0.5 rounded font-black uppercase tracking-wider font-mono">Spotlight row active</span>
              </div>
            </div>

            {/* Horizontal Scroll Containers */}
            <div 
              id="featured-row-container" 
              className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar custom-scrollbar scroll-smooth"
            >
              {featuredAnime.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLinkClick(item.id, item.link)}
                  className="w-48 sm:w-56 shrink-0 snap-start group relative aspect-[2/3] bg-bg-dark rounded-2xl overflow-hidden border border-white/5 hover:border-brand/50 shadow-xl transition-all duration-300 cursor-pointer focus:outline-none"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Glass Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-95 flex flex-col justify-end p-4" />

                  {/* Rating Badge */}
                  {item.rating && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/85 backdrop-blur-md rounded-lg text-[9px] font-black text-brand uppercase tracking-wider border border-white/5 flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-white font-bold">{Number(item.rating).toFixed(1)}</span>
                    </div>
                  )}

                  {/* View counter */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/85 backdrop-blur-md rounded-lg text-[8px] font-black text-white/70 border border-white/5 uppercase tracking-wide flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                    <span>{item.clicks.toLocaleString()} VIEWS</span>
                  </div>

                  {/* Play Action button display on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform">
                      <Play className="text-white fill-current w-5 h-5 ml-0.5" />
                    </div>
                  </div>

                  {/* Title and details bottom text */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 shrink-0 pointer-events-none">
                    {item.category && (
                      <span className="text-[8px] font-black tracking-widest text-brand uppercase mb-1 block">
                        {item.category}
                      </span>
                    )}
                    <h3 className="font-extrabold text-[12px] sm:text-[13px] text-white line-clamp-2 leading-tight tracking-tight group-hover:text-brand transition-colors">
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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-brand rounded-full shadow-[0_0_15px_rgba(244,117,33,0.5)]" />
              <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white/95">
                {selectedCategory === "All" ? "Premium Series" : `${selectedCategory} Collection`}
              </h2>
            </div>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] ml-5">Exploration / Database / v2.0</p>
          </div>

          <div className="relative group max-w-sm w-full">
            <div className="absolute -inset-1 bg-brand/20 rounded-full blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand transition-colors" />
            <input 
              type="text" 
              placeholder="Search index..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="relative w-full bg-bg-dark/80 backdrop-blur-xl border border-white/5 focus:border-brand/50 outline-none rounded-full py-3.5 pl-11 pr-5 text-sm transition-all shadow-inner placeholder:text-white/10"
            />
          </div>
        </div>
        
        {/* Main Grid Component */}
        <AnimeGrid search={search} category={selectedCategory} />
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
