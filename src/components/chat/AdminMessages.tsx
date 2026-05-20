import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, User, Search, Filter, Loader2, Send, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { ChatThread, ChatMessage } from '../../types';
import { ChatWindow } from './ChatWindow';

interface AdminMessagesProps {
  theme: 'dark' | 'light';
  t: any;
  user: any;
}

export function AdminMessages({ theme, t, user }: AdminMessagesProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setThreads(data || []);
    } catch (err) {
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();

    // Subscribe to new threads or thread updates
    const channel = supabase
      .channel('chat_threads_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_threads' }, () => {
        fetchThreads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredThreads = threads.filter(thread => 
    thread.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    thread.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] lg:h-full">
      <div className="grid grid-cols-12 gap-0 lg:gap-8 h-full">
        {/* Thread List */}
        <div className={cn(
          "col-span-12 lg:col-span-4 flex flex-col border rounded-[32px] overflow-hidden bg-black/5 dark:bg-white/5 border-zinc-500/10 h-full",
          selectedThread ? "hidden lg:flex" : "flex"
        )}>
          <div className="p-6 border-b border-zinc-500/10 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary italic">Terminal_Mensajes</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="text" 
                placeholder="BUSCAR_USUARIO_O_PRODUCTO..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/20 border border-white/5 rounded-xl p-4 pl-12 text-[10px] font-black tracking-widest outline-none focus:border-primary transition-all text-white"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Escaneando Hilos...</p>
              </div>
            ) : filteredThreads.length > 0 ? (
              <div className="divide-y divide-zinc-500/10">
                {filteredThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={async () => {
                      setSelectedThread(thread);
                      // Reset unread count when selecting thread
                      if (thread.unread_count && thread.unread_count > 0) {
                        try {
                          await supabase
                            .from('chat_threads')
                            .update({ unread_count: 0 })
                            .eq('id', thread.id);
                          
                          setThreads(prev => prev.map(t => 
                            t.id === thread.id ? { ...t, unread_count: 0 } : t
                          ));
                        } catch (err) {
                          console.error('Error resetting unread count:', err);
                        }
                      }
                    }}
                    className={cn(
                      "w-full p-6 text-left transition-all hover:bg-primary/5 flex items-start gap-4 group relative",
                      selectedThread?.id === thread.id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                    )}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-zinc-500/10 flex items-center justify-center shrink-0 border border-white/5 relative">
                      <User className="w-6 h-6 text-zinc-500" />
                      {thread.unread_count !== undefined && thread.unread_count > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-600 text-white text-[10px] font-black rounded-full shadow-lg border-2 border-zinc-900">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 truncate">
                        {thread.user_email || 'USUARIO_ANÓNIMO'}
                      </p>
                      <h4 className="text-xs font-black uppercase tracking-tighter italic mb-2 truncate">
                        {thread.product_name || 'Consulta General'}
                      </h4>
                      <p className={cn(
                        "text-[10px] truncate mb-2",
                        thread.unread_count !== undefined && thread.unread_count > 0 
                          ? "text-white font-bold" 
                          : "text-zinc-500 font-medium"
                      )}>
                        {thread.last_sender_id === user.id ? (
                          <span className="text-primary font-black mr-1">TÚ:</span>
                        ) : null}
                        {thread.last_message || 'Iniciando conversación...'}
                      </p>
                      <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                        {new Date(thread.updated_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center opacity-40 flex flex-col items-center gap-4">
                <MessageSquare className="w-12 h-12" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No se encontraron hilos de chat activos en este protocolo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={cn(
          "col-span-12 lg:col-span-8 flex flex-col border rounded-[32px] overflow-hidden bg-black/5 dark:bg-white/5 border-zinc-500/10 h-full",
          !selectedThread ? "hidden lg:flex" : "flex"
        )}>
          {selectedThread ? (
            <div className="flex flex-col h-full">
              <div className="p-4 md:p-8 border-b border-zinc-500/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <button 
                    onClick={() => setSelectedThread(null)}
                    className="lg:hidden p-2 hover:bg-zinc-500/10 rounded-xl transition-colors text-zinc-500"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter mb-1 truncate">{selectedThread.product_name || 'Protocolo_Libre'}</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary truncate">{selectedThread.user_email}</p>
                  </div>
                </div>
                <div className="hidden sm:block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shrink-0">
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 animate-pulse">TERMINAL_ACTIVA</span>
                </div>
              </div>
              
              <div className="flex-grow p-4 md:p-8 min-h-0">
                <ChatWindow threadId={selectedThread.id} user={user} theme={theme} t={t} />
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-12 text-center h-full">
              <div className="w-24 h-24 bg-primary/5 rounded-[40px] flex items-center justify-center mb-8 border border-primary/10">
                <MessageSquare className="w-10 h-10 text-primary opacity-40" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Selecciona un Canal de Chat</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.3em] max-w-sm leading-relaxed">Identifica hilos de mensajes específicos de usuarios para iniciar el protocolo de comunicación.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
