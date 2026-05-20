import React, { useState } from 'react';
import { Bot, Menu } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { AdminSidebar } from '../admin/AdminSidebar';
import { Dashboard } from '../admin/Dashboard';
import { Orders } from '../admin/Orders';
import { VendorPortal } from '../admin/VendorPortal';
import { UsersList } from '../admin/Users';
import { ProductLikes } from '../admin/ProductLikes';
import { AdminMessages } from '../chat/AdminMessages';

export function AdminView({ user, orders, theme, t, onProductChange }: any) {
  const [activeSection, setActiveSection] = useState('vendor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audio.play().catch(err => console.error('Error playing sound:', err));
  };

  const fetchTotalUnread = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .select('unread_count');
      
      if (error) throw error;
      const total = data.reduce((acc, curr) => acc + (curr.unread_count || 0), 0);
      setUnreadCount(total);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  React.useEffect(() => {
    if (!user) return;
    fetchTotalUnread();

    // Listen for new messages globally for the admin
    const channel = supabase
      .channel('admin_global_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        // Only trigger if message is NOT from the current admin
        if (payload.new.sender_id !== user.id) {
          setUnreadCount(prev => prev + 1);
          playNotificationSound();
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_threads'
      }, (payload) => {
        // Update unread count if threads are updated (e.g. read)
        fetchTotalUnread();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Reset total indicator when entering messages section is not enough, 
  // they reset per thread in AdminMessages, so we refetch when section changes
  React.useEffect(() => {
    if (activeSection === 'messages') {
      fetchTotalUnread();
    }
  }, [activeSection]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-32 px-4">
        <form onSubmit={handleLogin} className={cn("border p-12 rounded-[40px] text-center shadow-3xl",
          theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200")}>
          <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-12 border border-primary/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <Bot className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">{t.adminLogin}</h2>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.3em] mb-12 leading-relaxed">{t.securedTerminal}</p>
          
          <div className="space-y-6 mb-12">
            <input 
              type="email" placeholder="operator_01@nova3d.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className={cn("w-full border rounded-2xl p-5 text-xs font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200")} 
              required
            />
            <input 
              type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              className={cn("w-full border rounded-2xl p-5 text-xs font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200")} 
              required
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(245,158,11,0.2)] bg-primary text-white hover:bg-primary-dark hover:-translate-y-1 disabled:opacity-50">
            {loading ? 'INITIALIZING_SESSION...' : t.authenticate}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">
      <AdminSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        onLogout={handleLogout} 
        theme={theme} 
        t={t} 
        unreadCount={unreadCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-grow overflow-y-auto p-4 md:p-12 custom-scrollbar">
        <header className="mb-8 md:mb-16 flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-3 rounded-2xl bg-zinc-500/10 text-zinc-500 hover:text-primary transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-2">
              Sección__{activeSection}
            </h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.5em] opacity-60">System Operational // Level 4 Clear</p>
          </div>
        </header>

        {activeSection === 'dashboard' && <Dashboard theme={theme} t={t} />}
        {activeSection === 'orders' && <Orders theme={theme} t={t} />}
        {activeSection === 'vendor' && <VendorPortal theme={theme} t={t} onProductChange={onProductChange} />}
        {activeSection === 'likes' && <ProductLikes theme={theme} t={t} />}
        {activeSection === 'messages' && <AdminMessages theme={theme} t={t} user={user} />}
        {activeSection === 'users' && <UsersList theme={theme} t={t} />}
      </main>
    </div>
  );
}
