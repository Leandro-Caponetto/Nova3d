import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Sun, Moon, Languages, User, LogOut, Facebook, Instagram, Mail, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Nova3DLogo } from '../common/Nova3DLogo';

const TikTokIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.64 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.08z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

export function Navbar({ 
  theme, setTheme, lang, setLang, activeTab, setActiveTab, cartCount, user, isAdmin, setIsAuthModalOpen, t, supabase,
  searchQuery, setSearchQuery 
}: any) {
  const [isSearchVisible, setIsSearchVisible] = React.useState(false);
  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 pointer-events-none">
      <div className={cn("relative z-10 border-b pointer-events-auto", 
        theme === 'dark' ? "bg-bg-base/80 backdrop-blur-md border-white/5" : "bg-bg-base/80 backdrop-blur-md border-zinc-200")}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer group flex-shrink-0" onClick={() => setActiveTab('home')}>
            <Nova3DLogo theme={theme} />
            <span className="text-2xl font-black tracking-tighter uppercase italic hidden sm:inline">
              NOVA<span className="text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-colors group-hover:text-primary-light">3D</span>
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-grow max-w-md mx-4 pointer-events-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'gallery' && e.target.value.length > 0) {
                    setActiveTab('gallery');
                  }
                }}
                placeholder={t.searchPlaceholder}
                className={cn(
                  "w-full bg-zinc-500/5 border border-zinc-500/10 rounded-2xl py-2.5 pl-11 pr-11 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all",
                  theme === 'dark' ? "text-white placeholder:text-zinc-600" : "text-black placeholder:text-zinc-400"
                )}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-primary transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex-shrink-0">
            <button onClick={() => setActiveTab('home')} className={cn("hover:text-primary transition-all relative py-2", activeTab === 'home' ? "text-primary" : "")}>
              {t.home}
              {activeTab === 'home' && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(245,158,11,1),0_0_20px_rgba(245,158,11,0.6)]" />}
            </button>
            <button onClick={() => setActiveTab('gallery')} className={cn("hover:text-primary transition-all relative py-2", activeTab === 'gallery' ? "text-primary" : "")}>
              {t.catalog}
              {activeTab === 'gallery' && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(245,158,11,1),0_0_20px_rgba(245,158,11,0.6)]" />}
            </button>
            <button onClick={() => setActiveTab('quote')} className={cn("hover:text-primary transition-all relative py-2", activeTab === 'quote' ? "text-primary" : "")}>
              {t.quote}
              {activeTab === 'quote' && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(245,158,11,1),0_0_20px_rgba(245,158,11,0.6)]" />}
            </button>
            <button onClick={() => setActiveTab('contact')} className={cn("hover:text-primary transition-all relative py-2", activeTab === 'contact' ? "text-primary" : "")}>
              {t.contact}
              {activeTab === 'contact' && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(245,158,11,1),0_0_20px_rgba(245,158,11,0.6)]" />}
            </button>
            {isAdmin && (
              <button onClick={() => setActiveTab('admin')} className={cn("hover:text-primary transition-all relative py-2", activeTab === 'admin' ? "text-primary" : "")}>
                {t.admin}
                {activeTab === 'admin' && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(245,158,11,1),0_0_20px_rgba(245,158,11,0.6)]" />}
              </button>
            )}
          </div>
  
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 border-r border-zinc-500/10 pr-4">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 hover:bg-zinc-500/10 rounded-xl transition-colors text-zinc-500 hover:text-primary"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                className="p-2.5 hover:bg-zinc-500/10 rounded-xl transition-colors flex items-center h-full gap-2 text-[9px] font-black uppercase text-zinc-500 hover:text-primary"
              >
                <Languages className="w-4 h-4" />
                <span>{lang}</span>
              </button>
            </div>
  
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveTab('cart')}
                className={cn("relative p-2.5 transition-all hover:bg-primary/5 rounded-xl group", activeTab === 'cart' ? "text-primary" : "text-zinc-500")}
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f59e0b] text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-black text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-white/20 transition-transform scale-110">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => user ? supabase.auth.signOut() : setIsAuthModalOpen(true)}
                className={cn("flex flex-col items-center group transition-all duration-300 gap-1",
                  user ? "text-primary hover:text-primary-light" : (theme === 'dark' ? "text-white hover:text-primary" : "text-black hover:text-primary"))}
              >
                <div className={cn("w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all relative",
                  user 
                    ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                    : (theme === 'dark' ? "border-white/20 group-hover:border-primary/50" : "border-zinc-200 group-hover:border-primary/50")
                )}>
                  {user ? <LogOut className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  {user && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-bg-base shadow-sm" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{user ? t.logout : t.account}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating social links below navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-2 pointer-events-auto">
        <div className="flex justify-center">
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn("flex items-center gap-1 p-1 backdrop-blur-md border rounded-full shadow-lg transition-all",
              theme === 'dark' ? "bg-black/30 border-white/5 shadow-black/50" : "bg-white/40 border-zinc-200/50 shadow-black/5"
            )}
          >
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 hover:bg-primary/20 rounded-full transition-all text-zinc-500 hover:text-primary hover:scale-110">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 hover:bg-primary/20 rounded-full transition-all text-zinc-500 hover:text-primary hover:scale-110">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="p-2.5 hover:bg-primary/20 rounded-full transition-all text-zinc-500 hover:text-primary hover:scale-110">
              <TikTokIcon />
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="p-2.5 hover:bg-primary/20 rounded-full transition-all text-zinc-500 hover:text-primary hover:scale-110">
              <TelegramIcon />
            </a>
            <div className="w-px h-4 bg-zinc-500/20 mx-1.5" />
            <a href="mailto:caponettopeppers@gmail.com" className="p-2.5 hover:bg-primary/20 rounded-full transition-all text-zinc-500 hover:text-primary hover:scale-110">
              <Mail className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
