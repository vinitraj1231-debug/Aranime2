import { useState } from "react";
import BannerCarousel from "../components/BannerCarousel";
import AnimeGrid from "../components/AnimeGrid";
import { TrendingUp, Search } from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-8 pb-12">
      <BannerCarousel />
      
      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-brand rounded-full" />
            <TrendingUp className="text-brand w-6 h-6" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Popular Series</h2>
          </div>

          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand transition-colors" />
            <input 
              type="text" 
              placeholder="Search anime..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-dark border border-white/5 focus:border-brand/40 outline-none rounded-full py-2.5 pl-10 pr-4 text-sm transition-all"
            />
          </div>
        </div>
        
        <AnimeGrid search={search} />
      </div>

      {/* Footer Info / SEO Stuff */}
      <div className="max-w-7xl mx-auto w-full px-4 mt-12 border-t border-white/5 pt-12 text-center text-white/20">
        <p className="text-xs font-mono uppercase tracking-[0.2em] mb-2">AR ANIME PLATFORM v2.0</p>
        <p className="text-[10px]">Premium Anime Content. Cloud Hosted Engine.</p>
      </div>
    </div>
  );
}
