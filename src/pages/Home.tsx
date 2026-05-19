import { useState } from "react";
import BannerCarousel from "../components/BannerCarousel";
import AnimeGrid from "../components/AnimeGrid";
import { TrendingUp, Search } from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Action", "Comedy", "Drama", "Fantasy", "Romance", "Sci-Fi", "Slice of Life", "Adventure", "Supernatural"];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <BannerCarousel />
      
      <div className="max-w-7xl mx-auto w-full px-4 space-y-10">
        {/* Modern Categories Bar */}
        <div className="relative">
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
