import { Play } from "lucide-react";

interface AnimeCardProps {
  anime: {
    title: string;
    thumbnail: string;
    clicks: number;
    category?: string;
  };
  onClick: () => void;
}

export default function AnimeCard({ anime, onClick }: AnimeCardProps) {
  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col gap-2 text-left w-full focus:outline-none"
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-bg-dark border border-white/5 shadow-lg group-hover:border-brand/40 transition-all">
        <img 
          src={anime.thumbnail} 
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Play className="text-white fill-current w-6 h-6 ml-1" />
          </div>
        </div>

        {/* View Count Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-black text-white/90 border border-white/10 uppercase tracking-widest shadow-xl flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
          {anime.clicks.toLocaleString()} VIEWS
        </div>

        {/* Category Badge */}
        {anime.category && (
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-brand/90 backdrop-blur-sm rounded-md text-[9px] font-black text-white uppercase tracking-tighter shadow-lg border border-white/20">
            {anime.category}
          </div>
        )}
      </div>
      
      <div className="px-1 mt-1">
        <h3 className="font-bold text-[13px] sm:text-sm line-clamp-2 leading-snug group-hover:text-brand transition-colors text-white/90 tracking-tight">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
           <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.1em] px-1.5 py-0.5 border border-white/5 rounded italic">HD</span>
           <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Sub | Dub</span>
        </div>
      </div>
    </button>
  );
}
