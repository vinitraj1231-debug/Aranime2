import { Play } from "lucide-react";

interface AnimeCardProps {
  anime: {
    title: string;
    thumbnail: string;
    clicks: number;
    category?: string;
    rating?: number;
  };
  onClick: () => void;
}

export default function AnimeCard({ anime, onClick }: AnimeCardProps) {
  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col gap-3 text-left w-full focus:outline-none cursor-pointer"
    >
      <div className="relative aspect-[16/10] rounded-xl sm:rounded-[1.25rem] overflow-hidden bg-bg-dark border border-white/[0.08] shadow-2xl group-hover:border-brand/50 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(244,117,33,0.1)] transition-all duration-500 ease-out">
        <img 
          src={anime.thumbnail} 
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out grayscale-[0.2] group-hover:grayscale-0"
          loading="lazy"
        />
        
        {/* Advanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Hover Action Blur */}
        <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px] flex items-center justify-center">
          <div className="w-14 h-14 bg-brand/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl shadow-brand/40 transform scale-75 group-hover:scale-100 transition-all duration-500 ease-out border border-white/20">
            <Play className="text-white fill-current w-7 h-7 ml-1" />
          </div>
        </div>

        {/* Floating Badges Container */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
          <div className="flex items-start justify-between">
            {/* Category Badge */}
            {anime.category && (
              <div className="px-2.5 py-1 bg-brand/90 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest shadow-xl border border-white/10 group-hover:scale-105 transition-transform">
                {anime.category}
              </div>
            )}

            {/* View Count Badge */}
            <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-bold text-white border border-white/10 uppercase tracking-widest shadow-xl flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse shadow-[0_0_8px_rgba(244,117,33,0.8)]" />
              {anime.clicks.toLocaleString()}
            </div>
          </div>

          <div className="flex items-end justify-between">
            {/* Rating Badge */}
            {anime.rating !== undefined && anime.rating > 0 && (
              <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-wider shadow-xl border border-white/10 flex items-center gap-1.5">
                <span className="text-yellow-400 drop-shadow-glow">★</span>
                <span className="font-mono text-white/90">{Number(anime.rating).toFixed(1)}</span>
              </div>
            )}

            {/* Resolution Badge */}
            <div className="px-2 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black text-white/80 uppercase tracking-widest border border-white/5">
              4K UHD
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-1.5 space-y-1.5">
        <h3 className="font-black text-sm sm:text-base leading-snug group-hover:text-brand transition-colors text-white/90 tracking-tight line-clamp-2 uppercase">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2">
           <div className="h-0.5 w-6 bg-brand/30 group-hover:w-12 transition-all duration-500 rounded-full" />
           <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] group-hover:text-brand/50 transition-colors">B BLAZE PREMIUM</span>
        </div>
      </div>
    </button>
  );
}
