import { Link } from "react-router-dom";
import { User, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Clapperboard, LogOut, Settings, User as UserIcon } from "lucide-react";

interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
}

export default function Navbar({ user, isAdmin }: NavbarProps) {
  return (
    <nav className="bg-bg-dark border-b border-white/5 sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clapperboard className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent hidden sm:block uppercase tracking-tighter">
            AR<span className="text-brand"> ANIME</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link 
              to="/admin" 
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/70 hover:text-white"
              title="Admin Panel"
            >
              <Settings className="w-5 h-5" />
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end hidden xs:flex">
                <span className="text-xs font-medium text-white line-clamp-1">{user.displayName || "User"}</span>
                <span className="text-[10px] text-white/40">VIP Member</span>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-white/70 hover:text-red-500"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="bg-brand hover:bg-brand-dark transition-colors px-6 py-2 rounded-full font-semibold text-sm"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
