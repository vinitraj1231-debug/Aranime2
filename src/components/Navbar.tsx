import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { 
  Menu, 
  X, 
  ShieldAlert, 
  FileText, 
  Lock, 
  ChevronRight, 
  Scale, 
  Info, 
  Search, 
  User as UserIcon, 
  Send, 
  UserCheck, 
  MessageSquare, 
  Edit3, 
  RefreshCw,
  History,
  Trash2
} from "lucide-react";
import { useState, useEffect, FormEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
  search?: string;
  setSearch?: (val: string) => void;
}

export default function Navbar({ user, isAdmin, search = "", setSearch }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'none' | 'terms' | 'privacy'>('none');
  const location = useLocation();
  const navigate = useNavigate();

  const [profileName, setProfileName] = useState(() => localStorage.getItem("ar_anime_profile_name") || "");
  const [telegram, setTelegram] = useState(() => localStorage.getItem("ar_anime_profile_telegram") || "");
  const [bio, setBio] = useState(() => localStorage.getItem("ar_anime_profile_bio") || "");
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem("ar_anime_profile_photo") || "");
  const [isSaved, setIsSaved] = useState(() => localStorage.getItem("ar_anime_profile_saved") === "true");

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("ar_anime_recent_searches");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);


  const getUserId = () => {
    let id = localStorage.getItem("ar_anime_user_id");
    if (!id) {
      const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      id = tgUser?.id ? "tg_" + tgUser.id : "usr_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("ar_anime_user_id", id);
    }
    return id;
  };

  useEffect(() => {
    const autoSyncProfile = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        // Signal that the web app is ready to Telegram client
        if (tg) {
          tg.ready();
          tg.expand?.();
        }
        
        const tgUser = tg?.initDataUnsafe?.user;

        const uId = getUserId();
        let name = localStorage.getItem("ar_anime_profile_name") || "";
        let username = localStorage.getItem("ar_anime_profile_telegram") || "";
        let currentBio = localStorage.getItem("ar_anime_profile_bio") || "";
        let currentPhoto = localStorage.getItem("ar_anime_profile_photo") || "";

        let changed = false;

        if (tgUser) {
          const tgName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || "Telegram User";
          const tgUsername = tgUser.username || "tg_" + tgUser.id;
          const tgBio = tgUser.is_premium ? "Premium Telegram Member 🌟" : "Telegram Member";
          const tgPhoto = tgUser.photo_url || "";

          if (name !== tgName || username !== tgUsername || currentPhoto !== tgPhoto) {
            name = tgName;
            username = tgUsername;
            currentBio = tgBio;
            currentPhoto = tgPhoto;
            changed = true;
          }
        } else if (!name) {
          // Automatic seamless guest identity generation for non-form submission
          name = "TG Member #" + Math.floor(1000 + Math.random() * 9000);
          username = "tg_user_" + uId.substring(4, 9);
          currentBio = "Watching from Web Browser";
          currentPhoto = "";
          changed = true;
        }

        if (changed || !localStorage.getItem("ar_anime_profile_saved")) {
          setProfileName(name);
          setTelegram(username);
          setBio(currentBio);
          setProfilePhoto(currentPhoto);
          setIsSaved(true);

          localStorage.setItem("ar_anime_profile_name", name);
          localStorage.setItem("ar_anime_profile_telegram", username);
          localStorage.setItem("ar_anime_profile_bio", currentBio);
          localStorage.setItem("ar_anime_profile_photo", currentPhoto);
          localStorage.setItem("ar_anime_profile_saved", "true");

          const userDoc = doc(db, "user_profiles", uId);
          await setDoc(userDoc, {
            id: uId,
            name: name,
            telegram: username,
            bio: currentBio,
            photoUrl: currentPhoto,
            createdAt: new Date().toISOString()
          }, { merge: true });
        }

        // Always check premium status on load/sync
        const uId2 = getUserId();
        const userDocRef = doc(db, "user_profiles", uId2);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const isPremium = userDocSnap.data().isPremium || false;
          localStorage.setItem("ar_anime_user_premium", isPremium.toString());
        }
      } catch (err) {
        console.error("Auto sync profile failed:", err);
      }
    };

    autoSyncProfile();
  }, []);

  const saveSearchQuery = (query: string) => {
    const q = query.trim();
    if (!q) return;
    const updated = [q, ...recentSearches.filter(item => item.toLowerCase() !== q.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("ar_anime_recent_searches", JSON.stringify(updated));
  };

  const handleClearRecent = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setRecentSearches([]);
    localStorage.setItem("ar_anime_recent_searches", JSON.stringify([]));
  };

  const handleSearchChange = (val: string) => {
    if (setSearch) {
      setSearch(val);
      if (location.pathname !== "/") {
        navigate("/");
      }
    }
  };

  return (
    <>
      <nav className="bg-bg-dark border-b border-white/5 sticky top-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex justify-start">
            <Link id="nav-logo" to="/" className="flex items-center gap-1 group shrink-0">
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent uppercase tracking-tighter italic">
                BLAZE
              </span>
            </Link>
          </div>

          <div className="flex-1 flex justify-end items-center gap-2">
            {/* Header Search Bar */}
            <div className="relative group max-w-[150px] xs:max-w-[200px] sm:max-w-[250px] w-full">
              <div className="absolute -inset-1 bg-brand/20 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              <input
                id="header-search-bar"
                type="text"
                placeholder="SEARCH..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveSearchQuery(search);
                  }
                }}
                className="relative w-full bg-black/60 backdrop-blur-2xl border border-white/10 focus:border-brand/50 focus:ring-4 focus:ring-brand/10 outline-none rounded-full py-2 px-6 text-[10px] sm:text-xs text-center transition-all placeholder:text-white/10 text-white shadow-2xl font-black tracking-[0.1em] uppercase"
              />

              {/* Recent Searches Dropdown Panel */}
              <AnimatePresence>
                {isSearchFocused && recentSearches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 mt-2 bg-[#0d0d0f] border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl max-h-60"
                  >
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.01]">
                      <span className="text-[9px] font-black uppercase tracking-wider text-brand flex items-center gap-1.5">
                        <History className="w-3 h-3 opacity-80" /> Recent
                      </span>
                      <button
                        onMouseDown={(e) => handleClearRecent(e)}
                        className="text-[8px] font-black uppercase text-white/30 hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Clear
                      </button>
                    </div>
                    <div className="py-1">
                      {recentSearches.map((item, idx) => (
                        <button
                          key={idx}
                          onMouseDown={() => {
                            handleSearchChange(item);
                            saveSearchQuery(item);
                          }}
                          className="w-full text-left px-4 py-1.5 hover:bg-white/5 text-[10px] text-white/70 hover:text-brand transition-colors flex items-center gap-2 font-medium"
                        >
                          <History className="w-2.5 h-2.5 text-white/20" />
                          <span className="truncate">{item}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* 3-line Hamburger Menu representation */}
            <button
              id="nav-hamburger-btn"
              onClick={() => setIsOpen(true)}
              className="group flex flex-col gap-1 px-3 py-3 hover:bg-white/5 rounded-xl transition-all brightness-110 active:scale-95 shrink-0"
              title="Menu"
            >
              <div className="w-5 h-[2px] bg-brand group-hover:translate-x-0.5 transition-transform" />
              <div className="w-4 h-[2px] bg-white group-hover:w-5 transition-all" />
              <div className="w-5 h-[2px] bg-brand group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-out Drawer Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              id="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsOpen(false); setActiveSection('none'); }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            />

            {/* Sidebar drawer content */}
            <motion.div
              id="drawer-container"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg-dark border-l border-white/10 z-[100] shadow-2xl p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar text-white"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                <div>
                  <h3 className="text-lg font-black tracking-tight italic">
                    <span className="text-brand">BLAZE</span> MENU
                  </h3>
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-mono">Platform Portal v2.0</p>
                </div>
                <button
                  id="drawer-close-btn"
                  onClick={() => { setIsOpen(false); setActiveSection('none'); }}
                  className="p-2 hover:bg-white/5 rounded-xl text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links and Content */}
              <div className="flex-1 space-y-6">

                {/* Custom Telegram Profile Card */}
                <div className="bg-bg-darker border border-white/5 p-5 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand">Telegram Mini App Identity</span>
                    <span className="flex items-center gap-1 text-[8px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      ● Synced
                    </span>
                  </div>

                  {profileName ? (
                    <div className="bg-black/35 rounded-2xl p-4 border border-white/5 space-y-3">
                      <div className="flex items-center gap-3">
                        {profilePhoto ? (
                          <img 
                            src={profilePhoto} 
                            alt={profileName} 
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 bg-brand/15 border border-brand/20 rounded-xl object-cover shadow-md"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center font-black text-brand text-xs shrink-0">
                            {profileName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-white truncate">{profileName}</h4>
                          <a
                            href={`https://t.me/${telegram}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-brand font-bold hover:underline truncate block mt-0.5"
                          >
                            @{telegram}
                          </a>
                        </div>
                      </div>

                      {bio && (
                        <p className="text-[11px] text-white/50 leading-relaxed bg-bg-darker/50 p-2.5 rounded-xl border border-white/5">
                          {bio}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/5 border border-emerald-500/10 rounded-xl py-1.5 justify-center">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Profile Connected to Admin Hub</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-white/30 space-y-2">
                       <RefreshCw className="w-4 h-4 animate-spin text-brand" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Syncing Telegram Context...</span>
                    </div>
                  )}
                </div>

                
                {/* Brand description or badge */}
                <div className="bg-bg-darker border border-white/5 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center shrink-0">
                    <Scale className="text-brand w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Age Verification Standard</h4>
                    <p className="text-[11px] text-white/40 mt-1 leading-snug">
                      Access is reserved strictly for users 18 years of age or older. We maintain catalog indexes pointing to secure global channels.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 px-2">Navigation Check</span>
                  
                  <Link
                    id="drawer-home-link"
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all font-bold text-sm text-left shadow-sm group"
                  >
                    <span>Browse Index</span>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 group-hover:text-brand transition-all" />
                  </Link>

                  <Link
                    id="drawer-admin-link"
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-between p-3.5 bg-brand/10 hover:bg-brand/20 border border-brand/20 rounded-2xl transition-all font-bold text-sm text-left text-brand group"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Admin Console Gate
                    </span>
                    <ChevronRight className="w-4 h-4 text-brand group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 px-2">Disclaimers &amp; Information</span>

                  {/* Accordion 1: Terms & Conditions */}
                  <div className="border border-white/5 rounded-2xl overflow-hidden bg-bg-darker">
                    <button
                      id="drawer-terms-btn"
                      onClick={() => setActiveSection(activeSection === 'terms' ? 'none' : 'terms')}
                      className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-white/40" /> Terms of Service
                      </span>
                      <ChevronRight className={`w-4 h-4 text-white/30 transition-transform duration-300 ${activeSection === 'terms' ? 'rotate-90 text-brand' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeSection === 'terms' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 overflow-hidden border-t border-white/5"
                        >
                          <div className="pt-3 text-[11px] text-white/40 space-y-2 leading-relaxed text-left max-h-48 overflow-y-auto custom-scrollbar pr-1 select-none">
                            <p className="font-bold text-white">General Compliance:</p>
                            <p>You confirm you are at least 18 years old or possess legal majority status in your jurisdiction.</p>
                            <p className="font-bold text-white">External Catalog Redir:</p>
                            <p>All items provided as links point out to external, self-hosted distribution folders. BLAZE does not host any media files directly in its app container.</p>
                            <p className="font-bold text-white">Updates:</p>
                            <p>Catalog listings receive periodic live index patches by authorized administrators using a secure master gateway key.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Accordion 2: Privacy Policy */}
                  <div className="border border-white/5 rounded-2xl overflow-hidden bg-bg-darker">
                    <button
                      id="drawer-privacy-btn"
                      onClick={() => setActiveSection(activeSection === 'privacy' ? 'none' : 'privacy')}
                      className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-white/40" /> Privacy Policy
                      </span>
                      <ChevronRight className={`w-4 h-4 text-white/30 transition-transform duration-300 ${activeSection === 'privacy' ? 'rotate-90 text-brand' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeSection === 'privacy' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 overflow-hidden border-t border-white/5"
                        >
                          <div className="pt-3 text-[11px] text-white/40 space-y-2 leading-relaxed text-left max-h-48 overflow-y-auto custom-scrollbar pr-1 select-none">
                            <p className="font-bold text-white">Telemetry &amp; Logs:</p>
                            <p>We respect individual safety. Tracking is completely limited to numerical aggregate event ticks (clicks register as statistical values next to corresponding series cards).</p>
                            <p className="font-bold text-white">User Data:</p>
                            <p>We store zero account information, email rosters, search inputs, or navigation trails. Your preferences reside in regional local storage securely.</p>
                            <p className="font-bold text-white">Local Storage:</p>
                            <p>We use localized items exclusively to track age verification consents and display states.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

              </div>

              {/* Menu Footer */}
              <div className="pt-6 border-t border-white/5 mt-auto text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">BLAZE NETWORK</p>
                <p className="text-[9px] text-white/15 font-mono">RELEASE GROUP DISTRIBUTION PORTAL</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

