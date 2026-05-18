import { useState, useEffect, FormEvent } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Plus, Trash2, Eye, LayoutGrid, Image as ImageIcon, BarChart3, ShieldCheck, Search, MoreVertical } from "lucide-react";
import { motion } from "motion/react";

interface AdminProps {
  currentUserEmail: string;
}

export default function Admin({ currentUserEmail }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'anime' | 'banners' | 'admins'>('stats');
  const [anime, setAnime] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Forms
  const [animeForm, setAnimeForm] = useState({ title: '', thumbnail: '', link: '' });
  const [bannerForm, setBannerForm] = useState({ imageUrl: '', link: '', order: 0 });
  const [adminForm, setAdminForm] = useState({ email: '' });

  useEffect(() => {
    const unsubAnime = onSnapshot(query(collection(db, "anime"), orderBy("createdAt", "desc")), (snap) => 
      setAnime(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const unsubBanners = onSnapshot(query(collection(db, "banners"), orderBy("order", "asc")), (snap) => 
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const unsubAdmins = onSnapshot(query(collection(db, "admins")), (snap) => 
      setAdminsList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubAnime(); unsubBanners(); unsubAdmins(); };
  }, []);

  const handleAddAnime = async (e: FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "anime"), { ...animeForm, clicks: 0, createdAt: serverTimestamp(), isActive: true });
    setAnimeForm({ title: '', thumbnail: '', link: '' });
  };

  const handleAddBanner = async (e: FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "banners"), { ...bannerForm, order: Number(bannerForm.order), createdAt: serverTimestamp() });
    setBannerForm({ imageUrl: '', link: '', order: banners.length });
  };

  const handleAddAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminForm.email) return;
    await setDoc(doc(db, "admins", adminForm.email), { email: adminForm.email, addedAt: serverTimestamp() });
    setAdminForm({ email: '' });
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm("Are you sure?")) {
      await deleteDoc(doc(db, coll, id));
    }
  };

  const totalViews = anime.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const filteredAnime = anime.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto p-4 py-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
            AR<span className="text-brand">ANIME</span> <span className="text-sm not-italic font-mono uppercase bg-brand/10 text-brand px-2 py-1 rounded">Admin</span>
          </h1>
          <p className="text-white/40 text-xs mt-1 font-medium tracking-wide">Connected as: {currentUserEmail}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-bg-dark p-1 rounded-2xl border border-white/5 shadow-xl">
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 />} label="Stats" />
          <TabButton active={activeTab === 'anime'} onClick={() => setActiveTab('anime')} icon={<LayoutGrid />} label="Shows" />
          <TabButton active={activeTab === 'banners'} onClick={() => setActiveTab('banners')} icon={<ImageIcon />} label="Banners" />
          <TabButton active={activeTab === 'admins'} onClick={() => setActiveTab('admins')} icon={<ShieldCheck />} label="Admins" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'stats' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Series" value={anime.length} icon={<LayoutGrid className="text-brand" />} />
            <StatCard label="Global Views" value={totalViews} icon={<Eye className="text-cyan-400" />} />
            <StatCard label="Promo Slots" value={banners.length} icon={<ImageIcon className="text-purple-400" />} />
            <StatCard label="Auth Levels" value={adminsList.length + 1} icon={<ShieldCheck className="text-green-400" />} />
          </motion.div>
        )}

        {activeTab === 'anime' && (
          <div className="space-y-8">
            <section className="bg-bg-dark p-6 rounded-2xl border border-white/5">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 italic uppercase tracking-tight"><Plus className="w-5 h-5 text-brand" /> Add New Series</h2>
              <form onSubmit={handleAddAnime} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input label="Anime Title" value={animeForm.title} onChange={v => setAnimeForm({...animeForm, title: v})} required placeholder="e.g. Naruto Shippuden" />
                <Input label="Landscape Thumbnail" value={animeForm.thumbnail} onChange={v => setAnimeForm({...animeForm, thumbnail: v})} required placeholder="URL to JPEG/PNG" />
                <Input label="Target Redirect Link" value={animeForm.link} onChange={v => setAnimeForm({...animeForm, link: v})} required placeholder="Telegram/Mega Link" />
                <button className="sm:col-span-full lg:col-span-1 bg-brand hover:bg-brand-dark transition-all py-3 rounded-xl font-bold h-[45px] mt-auto">Push Series Live</button>
              </form>
            </section>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Database Index ({filteredAnime.length})</h3>
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Search index..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-bg-dark border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs focus:border-brand/40 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAnime.map(item => (
                  <div key={item.id} className="bg-bg-dark p-4 rounded-xl border border-white/5 flex items-center gap-4 group">
                    <img src={item.thumbnail} className="w-16 h-20 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate text-sm">{item.title}</h3>
                      <p className="text-[10px] text-white/30 truncate mt-1">{item.link}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] bg-brand/10 text-brand px-2 py-0.5 rounded font-black uppercase">{item.clicks} Views</span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete('anime', item.id)} className="p-2 hover:bg-red-500/10 text-white/10 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-8">
             <section className="bg-bg-dark p-6 rounded-2xl border border-white/5">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 italic uppercase tracking-tight">< ImageIcon className="w-5 h-5 text-brand" /> New Promo Spotlight</h2>
              <form onSubmit={handleAddBanner} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Input label="Landscape Banner URL" value={bannerForm.imageUrl} onChange={v => setBannerForm({...bannerForm, imageUrl: v})} required />
                <Input label="Destination Link" value={bannerForm.link} onChange={v => setBannerForm({...bannerForm, link: v})} required />
                <Input label="Display Index" type="number" value={bannerForm.order.toString()} onChange={v => setBannerForm({...bannerForm, order: Number(v)})} />
                <button className="sm:col-span-3 bg-brand hover:bg-brand-dark transition-all py-3 rounded-xl font-bold">Mount Banner</button>
              </form>
            </section>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {banners.map(banner => (
                <div key={banner.id} className="bg-bg-dark p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
                  <img src={banner.imageUrl} className="w-full aspect-[21/9] object-cover rounded-xl" />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-white/40 truncate font-mono uppercase tracking-widest">{banner.link}</p>
                      <span className="text-[10px] text-white/60 font-bold mt-1 inline-block uppercase italic">Slot Position: {banner.order}</span>
                    </div>
                    <button onClick={() => handleDelete('banners', banner.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="space-y-8 max-w-2xl">
            <section className="bg-bg-dark p-6 rounded-2xl border border-white/5">
               <h2 className="text-lg font-bold mb-6 flex items-center gap-2 italic uppercase tracking-tight"><ShieldCheck className="w-5 h-5 text-brand" /> Grant Access</h2>
               <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input label="Email Address" value={adminForm.email} onChange={v => setAdminForm({ email: v })} required placeholder="admin@example.com" />
                  </div>
                  <button className="bg-brand hover:bg-brand-dark px-8 py-3 rounded-xl font-bold self-end h-[45px]">Provision</button>
               </form>
            </section>

            <div className="space-y-3">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 ml-1">Registered Personnel</h3>
               <div className="bg-bg-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-4 flex items-center gap-4 bg-white/5 border-b border-white/5">
                     <div className="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center text-brand font-bold">SA</div>
                     <div className="flex-1">
                        <p className="text-sm font-bold">kvinit6421@gmail.com</p>
                        <p className="text-[10px] text-brand/60 uppercase font-black tracking-widest">Master Super Admin</p>
                     </div>
                  </div>
                  
                  {adminsList.map(admin => (
                    <div key={admin.id} className="p-4 flex items-center gap-4 border-b border-white/5 last:border-0">
                       <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 font-bold uppercase">{admin.email[0]}</div>
                       <div className="flex-1">
                          <p className="text-sm font-bold">{admin.email}</p>
                          <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">General Administrator</p>
                       </div>
                       <button onClick={() => handleDelete('admins', admin.id)} title="Revoke access" className="p-2 hover:bg-red-500/10 text-white/10 hover:text-red-500 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${active ? 'bg-brand text-white shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
      {icon && <span className={active ? 'text-white' : 'text-white/20'}>{icon}</span>}
      {label}
    </button>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-bg-dark p-6 rounded-[2rem] border border-white/5 flex flex-col gap-6 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />
      <div className="grid place-content-center w-12 h-12 bg-bg-darker rounded-2xl border border-white/10 text-xl">
        {icon}
      </div>
      <div>
        <div className="text-4xl font-black font-mono tracking-tighter">{value}</div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1 block">{label}</span>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false, placeholder = "" }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="bg-bg-darker border border-white/10 focus:border-brand/40 rounded-xl p-3 outline-none transition-all text-sm text-white placeholder:text-white/10"
      />
    </div>
  );
}
