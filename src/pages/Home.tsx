import { useState } from "react";
import BannerCarousel from "../components/BannerCarousel";
import AnimeGrid from "../components/AnimeGrid";
import { TrendingUp, Search } from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Action", "Comedy", "Drama", "Fantasy", "Romance", "Sci-Fi", "Slice of Life", "Adventure", "Supernatural"];

  return (
    <div className="flex flex-col gap-4 pb-12">
      <BannerCarousel />
      
      <div className="max-w-7xl mx-auto w-full px-4 space-y-8">
        {/* Categories Scroller */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat 
                ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20' 
                : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-brand rounded-full" />
            <TrendingUp className="text-brand w-6 h-6" />
            <h2 className="text-2xl font-bold uppercase tracking-tight italic">
              {selectedCategory === "All" ? "Popular Series" : `${selectedCategory} Specials`}
            </h2>
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
        
        <AnimeGrid search={search} category={selectedCategory} />
      </div>

      {/* Footer Info / SEO Stuff */}
      <div className="max-w-7xl mx-auto w-full px-4 mt-12 border-t border-white/5 pt-12 text-center text-white/20">
        <p className="text-xs font-mono uppercase tracking-[0.2em] mb-2">AR ANIME PLATFORM v2.0</p>
        <p className="text-[10px]">Premium Anime Content. Cloud Hosted Engine.</p>
      </div>
    </div>
  );
}
