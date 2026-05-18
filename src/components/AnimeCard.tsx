import { Play } from "lucide-react";

interface AnimeCardProps {
  anime: {
    title: string;
    thumbnail: string;
    clicks: number;
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
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white/90 border border-white/10 uppercase tracking-wider">
          {anime.clicks} Views
        </div>
      </div>
      
      <div className="px-1">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-brand transition-colors">
          {anime.title}
        </h3>
        <p className="text-[10px] text-white/40 font-mono mt-1 uppercase tracking-tighter">
          Subtitled | Dubbed
        </p>
      </div>
    </button>
  );
}
