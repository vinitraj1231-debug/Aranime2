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
      className="group relative flex flex-col gap-2.5 text-left w-full focus:outline-none cursor-pointer"
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-bg-dark border border-white/10 shadow-lg group-hover:border-brand/60 group-hover:shadow-brand/5 transition-all duration-300">
        <img 
          src={anime.thumbnail} 
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center shadow-xl shadow-brand/40 transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="text-white fill-current w-6 h-6 ml-0.5" />
          </div>
        </div>

        {/* View Count Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/85 backdrop-blur-md rounded-lg text-[9px] sm:text-[10px] font-black text-white border border-white/10 uppercase tracking-widest shadow-md flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
          {anime.clicks.toLocaleString()}
        </div>

        {/* Category Badge */}
        {anime.category && (
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-brand/95 backdrop-blur-sm rounded-lg text-[9px] font-black text-white uppercase tracking-wider shadow-md border border-white/15">
            {anime.category}
          </div>
        )}

        {/* Rating Badge */}
        {anime.rating !== undefined && anime.rating > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/85 backdrop-blur-sm rounded-lg text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-wider shadow-lg border border-white/10 flex items-center gap-1.5">
            <span className="text-yellow-400">★</span>
            <span className="text-white font-mono">{Number(anime.rating).toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <div className="px-1.5 mt-0.5 space-y-1">
        <h3 className="font-extrabold text-sm sm:text-base md:text-[17px] line-clamp-2 leading-snug group-hover:text-brand transition-colors text-white tracking-tight">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
           <span className="text-[10px] sm:text-[10px] text-white/50 font-black uppercase tracking-widest px-2 py-0.5 border border-white/10 rounded-lg bg-white/[0.03] italic">4K UHD</span>
           <span className="text-[10px] sm:text-[10px] text-brand font-black uppercase tracking-widest">Premium Video</span>
        </div>
      </div>
    </button>
  );
}
