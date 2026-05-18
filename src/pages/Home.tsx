import BannerCarousel from "../components/BannerCarousel";
import AnimeGrid from "../components/AnimeGrid";
import { TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <BannerCarousel />
      
      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-8 bg-brand rounded-full" />
          <TrendingUp className="text-brand w-6 h-6" />
          <h2 className="text-2xl font-bold uppercase tracking-tight">Popular Series</h2>
        </div>
        
        <AnimeGrid />
      </div>

      {/* Footer Info / SEO Stuff */}
      <div className="max-w-7xl mx-auto w-full px-4 mt-12 border-t border-white/5 pt-12 text-center text-white/20">
        <p className="text-xs font-mono uppercase tracking-[0.2em] mb-2">AnimeHub v2.0 Platform</p>
        <p className="text-[10px]">Managed via Telecom Mini App Engine. AR ANIME CLONE.</p>
      </div>
    </div>
  );
}
