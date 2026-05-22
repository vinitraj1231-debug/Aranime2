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
  RefreshCw 
} from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { doc, setDoc } from "firebase/firestore";
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
  const [isSaved, setIsSaved] = useState(() => localStorage.getItem("ar_anime_profile_saved") === "true");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const getUserId = () => {
    let id = localStorage.getItem("ar_anime_user_id");
    if (!id) {
      id = "usr_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("ar_anime_user_id", id);
    }
    return id;
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !telegram.trim()) {
      setProfileError("Name and Telegram are required.");
      return;
    }
    setIsSaving(true);
    setProfileError("");

    try {
      const uId = getUserId();
      let formattedTelegram = telegram.trim();
      if (formattedTelegram.startsWith("@")) {
        formattedTelegram = formattedTelegram.substring(1);
      }

      await setDoc(doc(db, "user_profiles", uId), {
        id: uId,
        name: profileName.trim(),
        telegram: formattedTelegram,
        bio: bio.trim(),
        createdAt: new Date().toISOString()
      });

      localStorage.setItem("ar_anime_profile_name", profileName.trim());
      localStorage.setItem("ar_anime_profile_telegram", formattedTelegram);
      localStorage.setItem("ar_anime_profile_bio", bio.trim());
      localStorage.setItem("ar_anime_profile_saved", "true");

      setIsSaved(true);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile to Firestore:", err);
      setProfileError("Could not save profile. Check connection.");
    } finally {
      setIsSaving(false);
    }
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
      <nav className="bg-bg-dark border-b border-white/5 sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link id="nav-logo" to="/" className="flex items-center gap-1 group shrink-0">
            <div className="bg-brand px-2.5 py-1.5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-black italic text-xl leading-none">AR</span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent uppercase tracking-tighter italic ml-0.5">
              ANIME
            </span>
          </Link>

          {/* Header Search Bar */}
          <div className="relative group max-w-[200px] xs:max-w-[280px] sm:max-w-xs md:max-w-sm w-full mx-auto px-1 sm:px-4">
            <div className="absolute -inset-0.5 bg-brand/15 rounded-full blur opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            <Search className="absolute left-4 sm:left-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 group-focus-within:text-brand transition-colors" />
            <input 
              id="header-search-bar"
              type="text" 
              placeholder="Search index..." 
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="relative w-full bg-black/40 backdrop-blur-md border border-white/5 focus:border-brand/40 outline-none rounded-full py-2 pl-9 sm:pl-11 pr-4 text-xs transition-all placeholder:text-white/20 text-white shadow-inner"
            />
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
                  <h3 className="text-lg font-black tracking-tighter italic">
                    AR<span className="text-brand">ANIME</span> MENU
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
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand">Visitor Identity Portal</span>
                    {isSaved && !isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-brand" /> Edit
                      </button>
                    )}
                  </div>

                  {!isSaved || isEditing ? (
                    <form onSubmit={handleSaveProfile} className="space-y-3.5 select-text">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-white/35 mb-1.5">Telegram Display Name *</label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={e => setProfileName(e.target.value)}
                          placeholder="e.g. Vinit Kumar"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-brand/40 outline-none transition-all text-white placeholder:text-white/10"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-white/35 mb-1.5">Telegram Username *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/35 font-bold">@</span>
                          <input
                            type="text"
                            required
                            value={telegram}
                            onChange={e => setTelegram(e.target.value)}
                            placeholder="username"
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs focus:border-brand/40 outline-none transition-all text-white placeholder:text-white/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-white/35 mb-1.5">Favorite category or message bio</label>
                        <textarea
                          value={bio}
                          onChange={e => setBio(e.target.value)}
                          placeholder="e.g. I love Fantasy and Action anime!"
                          rows={2}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-brand/40 outline-none resize-none transition-all text-white placeholder:text-white/10"
                        />
                      </div>

                      {profileError && (
                        <p className="text-[10px] text-red-400 font-bold tracking-tight">{profileError}</p>
                      )}

                      <div className="flex gap-2 pt-1.5">
                        {isSaved && (
                          <button
                            type="button"
                            onClick={() => { setIsEditing(false); setProfileError(""); }}
                            className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/5 text-white/40 hover:bg-white/10 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1 bg-brand hover:bg-brand-dark hover:scale-[1.01] active:scale-95 disabled:opacity-50 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand/10"
                        >
                          {isSaving ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          <span>Save Tele-Profile</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-black/35 rounded-2xl p-4 border border-white/5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center font-black text-brand text-xs">
                          {profileName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
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
                    <span>Browse Anime Index</span>
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
                            <p>All items provided as links point out to external, self-hosted distribution folders. AR ANIME does not host any media files directly in its app container.</p>
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
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">AR ANIME NETWORK</p>
                <p className="text-[9px] text-white/15 font-mono">RELEASE GROUP DISTRIBUTION PORTAL</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

