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
      className="group relative flex flex-col gap-1.5 text-left w-full focus:outline-none"
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-bg-dark border border-white/5 shadow-md group-hover:border-brand/40 transition-all">
        <img 
          src={anime.thumbnail} 
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform">
            <Play className="text-white fill-current w-5 h-5 ml-0.5" />
          </div>
        </div>

        {/* View Count Badge */}
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/75 backdrop-blur-md rounded text-[8px] sm:text-[9px] font-black text-white/90 border border-white/5 uppercase tracking-wider shadow-md flex items-center gap-1">
          <div className="w-1 h-1 bg-brand rounded-full animate-pulse" />
          {anime.clicks.toLocaleString()}
        </div>

        {/* Category Badge */}
        {anime.category && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-brand/90 backdrop-blur-sm rounded text-[8px] font-black text-white uppercase tracking-tight shadow-md border border-white/10">
            {anime.category}
          </div>
        )}

        {/* Rating Badge */}
        {anime.rating !== undefined && anime.rating > 0 && (
          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[8px] font-bold text-brand uppercase tracking-wider shadow-md border border-white/5 flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-white font-mono">{Number(anime.rating).toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <div className="px-0.5 mt-0.5">
        <h3 className="font-medium text-[11px] sm:text-xs line-clamp-2 leading-tight group-hover:text-brand transition-colors text-white/95 tracking-tight">
          {anime.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
           <span className="text-[8px] text-white/20 font-black uppercase tracking-wider px-1 py-0.2 border border-white/5 rounded italic">HD</span>
           <span className="text-[8px] text-white/20 font-bold uppercase tracking-wider">Sub | Dub</span>
        </div>
      </div>
    </button>
  );
}
