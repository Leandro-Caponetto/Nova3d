import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Sun, Moon, Languages, User, LogOut, Facebook, Instagram, Mail, Search, X, Trash2, ArrowRight, Menu } from 'lucide-react';
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
  theme, setTheme, lang, setLang, activeTab, setActiveTab, cartCount, cart, user, isAdmin, setIsAuthModalOpen, t, supabase,
  searchQuery, setSearchQuery 
}: any) {
  const [isBalloonOpen, setIsBalloonOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t.home },
    { id: 'gallery', label: t.catalog },
    { id: 'shop', label: t.shop },
    { id: 'community', label: t.community },
    { id: 'quote', label: t.quote },
    { id: 'contact', label: t.contact },
    ...(isAdmin ? [{ id: 'admin', label: t.admin }] : []),
  ];

  return (
    <nav className="sticky top-0 z-[100] transition-all duration-300 pointer-events-none">
      <div className={cn("relative z-10 border-b pointer-events-auto", 
        theme === 'dark' ? "bg-bg-base/80 backdrop-blur-md border-white/5" : "bg-bg-base/80 backdrop-blur-md border-zinc-200")}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer group flex-shrink-0" onClick={() => setActiveTab('home')}>
            <Nova3DLogo theme={theme} />
            <span className={cn("text-2xl font-black tracking-tighter uppercase italic hidden sm:inline", theme === 'dark' ? "text-white" : "text-black")}>
              NOVA<span className="text-primary glow-text transition-all group-hover:text-primary-light">3D</span>
            </span>
          </div>


          
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex-shrink-0">
            {navLinks.map((link) => (
              <button 
                key={link.id}
                onClick={() => setActiveTab(link.id)} 
                className={cn("hover:text-primary transition-all relative py-2", activeTab === link.id ? "text-primary" : "")}
              >
                {link.label}
                {activeTab === link.id && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
              </button>
            ))}
          </div>
  
          <div className="flex items-center gap-2 sm:gap-6">
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
  
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative">
                <button 
                  onClick={() => setIsBalloonOpen(!isBalloonOpen)}
                  className={cn("relative p-2.5 transition-all hover:bg-primary/5 rounded-xl group", isBalloonOpen ? "text-primary" : "text-zinc-500")}
                >
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-in zoom-in duration-300">
                      {cartCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isBalloonOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0, y: 20, rotate: -10 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0, 
                        rotate: 0,
                        transition: {
                          type: "spring",
                          stiffness: 260,
                          damping: 20
                        }
                      }}
                      exit={{ opacity: 0, scale: 0, y: 20, rotate: 10 }}
                      className="absolute right-0 top-full mt-4 w-72 origin-top-right z-50 pointer-events-auto"
                    >
                      {/* Floating Loop Animation */}
                      <motion.div
                        animate={{
                          y: [-5, 5, -5],
                          rotate: [-1, 1, -1]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className={cn(
                          "rounded-[2.5rem] border p-6 shadow-2xl relative",
                          theme === 'dark' ? "bg-zinc-900/95 backdrop-blur-xl border-white/10" : "bg-white/95 backdrop-blur-xl border-zinc-200"
                        )}
                      >
                        {/* Balloon Triangle/Tether */}
                        <div className={cn(
                          "absolute -top-2 right-6 w-4 h-4 rotate-45 border-l border-t",
                          theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
                        )} />

                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Tu Carrito</h4>
                        
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {cart?.length === 0 ? (
                            <p className="text-zinc-500 text-[10px] font-bold uppercase py-8 text-center">Carrito vacío</p>
                          ) : (
                            cart?.map((item: any) => (
                              <div key={item.id} className="flex gap-4 group">
                                <div className="w-14 h-14 rounded-2xl border border-zinc-500/10 overflow-hidden flex-shrink-0 bg-zinc-800 relative group/item">
                                  {item.images && item.images.length > 0 ? (
                                    <img 
                                      src={item.images[0]} 
                                      alt={item.name} 
                                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                          parent.insertAdjacentHTML('beforeend', '<div class="w-full h-full flex items-center justify-center text-[10px] font-black text-zinc-600 bg-zinc-800">3D</div>');
                                        }
                                      }}
                                    />
                                  ) : item.image ? (
                                    <img 
                                      src={item.image} 
                                      alt={item.name} 
                                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                          parent.insertAdjacentHTML('beforeend', '<div class="w-full h-full flex items-center justify-center text-[10px] font-black text-zinc-600 bg-zinc-800">3D</div>');
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-zinc-600">3D</div>
                                  )}
                                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <h5 className="text-[10px] font-black uppercase tracking-tight truncate leading-none mb-1">{item.name}</h5>
                                  <p className="text-[9px] font-bold text-zinc-500">{item.quantity} x ${item.price}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {cart?.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-zinc-500/10">
                            <button 
                              onClick={() => {
                                setIsBalloonOpen(false);
                                setActiveTab('cart');
                              }}
                              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-[9px] uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center justify-center gap-3 group"
                            >
                              Ver Todo <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
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
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{user ? t.logout : t.account}</span>
              </button>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 hover:bg-zinc-500/10 rounded-xl transition-colors text-zinc-500 hover:text-primary"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navbar containing Search and Social Media Integration */}
      <div className={cn("border-b pointer-events-auto transition-all", 
        theme === 'dark' 
          ? "bg-bg-base/90 backdrop-blur-md border-white/5" 
          : "bg-bg-base/90 backdrop-blur-md border-zinc-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="relative group w-full max-w-lg">
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
                "w-full bg-zinc-500/5 border border-zinc-500/10 rounded-xl py-2 pl-11 pr-11 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all",
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

          <div className="flex items-center gap-1">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary/10 rounded-xl transition-all text-zinc-500 hover:text-primary hover:scale-110">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary/10 rounded-xl transition-all text-zinc-500 hover:text-primary hover:scale-110">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary/10 rounded-xl transition-all text-zinc-500 hover:text-primary hover:scale-110">
              <TikTokIcon />
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary/10 rounded-xl transition-all text-zinc-500 hover:text-primary hover:scale-110">
              <TelegramIcon />
            </a>
            <div className="w-px h-4 bg-zinc-500/20 mx-1.5" />
            <a href="mailto:caponettopeppers@gmail.com" className="p-2 hover:bg-primary/10 rounded-xl transition-all text-zinc-500 hover:text-primary hover:scale-110">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn("lg:hidden relative z-0 border-b pointer-events-auto overflow-hidden",
              theme === 'dark' ? "bg-bg-base/95 backdrop-blur-xl border-white/5" : "bg-bg-base/95 backdrop-blur-xl border-zinc-200"
            )}
          >
            <div className="px-4 py-8 space-y-6">
              {navLinks.map((link) => (
                <button 
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn("w-full text-left text-sm font-black uppercase tracking-[0.3em] py-3 px-4 rounded-2xl transition-all",
                    activeTab === link.id 
                      ? "bg-primary text-white shadow-[0_10px_25px_rgba(245,158,11,0.3)]" 
                      : (theme === 'dark' ? "text-zinc-500 hover:bg-white/5" : "text-zinc-500 hover:bg-black/5")
                  )}
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-6 border-t border-zinc-500/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-4 bg-zinc-500/10 rounded-2xl transition-colors text-zinc-500"
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                    className="py-4 px-6 bg-zinc-500/10 rounded-2xl transition-colors font-black uppercase text-[10px] tracking-widest text-zinc-500"
                  >
                    {lang === 'es' ? 'English' : 'Español'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </nav>
  );
}
