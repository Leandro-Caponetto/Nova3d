import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { ChatMessage, ChatThread } from '../../types';

interface ChatWindowProps {
  threadId: string;
  user: any;
  theme: 'dark' | 'light';
  t: any;
}

export function ChatWindow({ threadId, user, theme, t }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [othersTyping, setOthersTyping] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audio.play().catch(err => console.error('Error playing sound:', err));
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Fetch Messages Error:', error);
        setError(`Error al cargar mensajes: ${error.message} (${error.code})`);
        return;
      }
      setMessages(data || []);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(`Error inesperado al cargar mensajes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to messages and presence (typing indicator)
    const channel = supabase.channel(`chat:${threadId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `thread_id=eq.${threadId}`
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        
        // Play sound if message is from the OTHER person
        if (newMsg.sender_id !== user.id) {
          playNotificationSound();
        }

        setMessages((prev) => {
          // Avoid duplicate messages if optimistic update already added it
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typingUsers: string[] = [];
        
        Object.entries(state).forEach(([key, presence]: [string, any]) => {
          if (key !== user.id && presence[0]?.isTyping) {
            typingUsers.push(presence[0].user_email || 'Operador');
          }
        });
        setOthersTyping(typingUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ isTyping: false, user_email: user.email });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, user.id, user.email]);

  const updateTypingStatus = async (typing: boolean) => {
    const channel = supabase.channel(`chat:${threadId}`);
    await channel.track({ isTyping: typing, user_email: user.email });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Typing indicator logic
    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsTyping(false);
    updateTypingStatus(false);

    // Optimistic Update: Add message immediately to UI
    const tempId = Math.random().toString();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      thread_id: threadId,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const { data, error } = await supabase.from('chat_messages').insert([{
        thread_id: threadId,
        sender_id: user.id,
        content: messageContent
      }]).select().single();

      if (error) throw error;
      
      // Replace optimistic message with the real one from DB
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));

      // Update thread last_message, last_sender_id and updated_at
      await supabase.from('chat_threads').update({
        last_message: messageContent,
        last_sender_id: user.id,
        updated_at: new Date().toISOString()
      }).eq('id', threadId);

    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('Error al enviar mensaje.');
      // Remove the failed message from UI
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sincronizando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-4 space-y-4 mb-4 custom-scrollbar min-h-[300px] max-h-[400px]"
      >
        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
            <Bot className="w-12 h-12 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Inicia la conversación. El equipo de Nova3D te responderá pronto.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === user.id;
          return (
            <div 
              key={msg.id} 
              className={cn("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
            >
              <div className={cn(
                "p-4 rounded-2xl text-xs font-medium shadow-sm",
                isMe 
                  ? "bg-primary text-white rounded-tr-none" 
                  : (theme === 'dark' ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-800") + " rounded-tl-none"
              )}>
                {msg.content}
              </div>
              <span className="mt-1.5 text-[8px] font-black uppercase tracking-widest text-zinc-500 opacity-60">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {othersTyping.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 ml-2 mb-4"
          >
            <div className={cn(
              "p-3 px-4 rounded-2xl rounded-tl-none flex items-center gap-2",
              theme === 'dark' ? "bg-zinc-800" : "bg-zinc-100"
            )}>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">
                Contestando...
              </span>
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="relative mt-auto">
        <input 
          type="text" 
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Escribe un mensaje..."
          className={cn(
            "w-full p-5 pr-16 rounded-2xl text-xs font-black tracking-widest outline-none transition-all border",
            theme === 'dark' 
              ? "bg-black/40 border-white/10 text-white focus:border-primary" 
              : "bg-zinc-50 border-zinc-200 focus:border-primary"
          )}
        />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
