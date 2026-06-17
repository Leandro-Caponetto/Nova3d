import React from 'react';
import { LayoutDashboard, ShoppingBag, Box, Users, Power, ChevronRight, MessageSquare, Heart, X, Megaphone, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function AdminSidebar({ activeSection, setActiveSection, onLogout, theme, t, unreadCount, isOpen, onClose }: any) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Consola Central' },
    { id: 'orders', icon: ShoppingBag, label: t.orders || 'Pedidos' },
    { id: 'vendor', icon: Box, label: 'Sección__vendedor' },
    { id: 'likes', icon: Heart, label: 'Likes_Insight' },
    { id: 'news', icon: Megaphone, label: 'Novedades_Banner' },
    { id: 'community-manager', icon: FileCode, label: 'Modelos 3D (stl/3mf)' },
    { id: 'messages', icon: MessageSquare, label: 'Chat Directo', badgeCount: unreadCount },
    { id: 'users', icon: Users, label: 'Operadores' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-72 flex flex-col h-full border-r transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto", 
        theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-zinc-500/10 mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-2">SYSTEM_ROOT</h3>
            <p className="text-xs font-black italic tracking-tighter uppercase">Admin Panel <span className="text-primary">v4.0</span></p>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-zinc-500/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <nav className="flex-grow px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                onClose();
              }}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl transition-all group relative",
                activeSection === item.id 
                  ? "bg-primary text-white shadow-[0_10px_20px_rgba(245,158,11,0.2)]" 
                  : "text-zinc-500 hover:bg-zinc-500/5 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 border-2 border-zinc-900 rounded-full text-[9px] font-black text-white animate-pulse transition-all shadow-lg">
                      {item.badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </div>
              {activeSection === item.id && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-zinc-500/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-4 rounded-xl text-pink-500 hover:bg-pink-500/5 transition-all text-[10px] font-black uppercase tracking-widest italic"
          >
            <Power className="w-5 h-5" />
            {t.terminate}
          </button>
        </div>
      </aside>
    </>
  );
}
