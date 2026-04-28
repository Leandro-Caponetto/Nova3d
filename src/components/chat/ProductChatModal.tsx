import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Product, ChatThread } from '../../types';
import { ChatWindow } from './ChatWindow';

interface ProductChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  user: any;
  theme: 'dark' | 'light';
  t: any;
}

export function ProductChatModal({ isOpen, onClose, product, user, theme, t }: ProductChatModalProps) {
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const getOrCreateThread = async () => {
    if (!user || !product) return;
    setLoading(true);
    setErrorDetails(null);

    try {
      // Check if thread exists for this user and product
      const { data: existingThreads, error: fetchError } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .limit(1);

      if (fetchError) {
        console.error('Fetch Error:', fetchError);
        setErrorDetails(`Error al buscar conversación: ${fetchError.message} (${fetchError.code})`);
        return;
      }

      if (existingThreads && existingThreads.length > 0) {
        setThread(existingThreads[0]);
      } else {
        // Create new thread
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert([{
            user_id: user.id,
            product_id: product.id,
            user_email: user.email,
            product_name: product.name,
            last_message: `Consulta sobre ${product.name}`
          }])
          .select()
          .single();

        if (createError) {
          console.error('Create Error:', createError);
          setErrorDetails(`Error al crear conversación: ${createError.message} (${createError.code})`);
          return;
        }
        setThread(newThread);
      }
    } catch (err: any) {
      console.error('Unexpected Error:', err);
      setErrorDetails(`Error inesperado: ${err.message || 'Desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user && product) {
      getOrCreateThread();
    }
  }, [isOpen, user, product]);

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn("relative w-full max-w-2xl rounded-[2.5rem] overflow-hidden border shadow-3xl",
              theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200")}
          >
            {/* Header */}
            <div className="p-8 pb-6 border-b border-zinc-500/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-1">{t.wsTitle || 'CONSULTA_DIRECTA'}</h3>
                    <p className="text-xl font-black italic uppercase tracking-tighter">Chat_Operador</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-zinc-500/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>

              {/* Product Info Bar */}
              <div className={cn("p-4 rounded-2xl flex items-center justify-between border",
                theme === 'dark' ? "bg-black/40 border-white/5" : "bg-zinc-50 border-zinc-100")}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/5 shrink-0">
                    <img src={product.images[0]} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest italic">{product.name}</h4>
                    <span className="text-[10px] font-mono text-primary font-black tracking-tighter">${product.price.toLocaleString()}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-700 hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Chat Area */}
            <div className="p-8 h-[500px]">
              {!user ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-6">
                  <div className="w-20 h-20 bg-zinc-500/5 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-zinc-700 animate-spin" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-2 italic">AUTENTICACIÓN_REQUERIDA</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">Debes iniciar sesión para comenzar un chat directo con nuestros operadores.</p>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Iniciando Terminal de Chat...</p>
                </div>
              ) : thread ? (
                <ChatWindow threadId={thread.id} user={user} theme={theme} t={t} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Error de Sincronización</h4>
                  <div className="p-4 bg-black/20 rounded-2xl border border-white/5 max-w-sm">
                    <p className="text-[10px] text-zinc-500 font-mono text-left break-words">
                      {errorDetails || "No se pudo establecer el túnel de chat. Verifica que las tablas de Supabase existan."}
                    </p>
                  </div>
                  <button 
                    onClick={getOrCreateThread}
                    className="mt-6 px-6 py-2 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/30 transition-all border border-primary/20"
                  >
                    Reintentar Conexión
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6 text-center border-t border-zinc-500/10">
              <span className="text-[8px] font-black uppercase tracking-[0.6em] text-zinc-600 opacity-50 italic">NOVA3D_DIRECT_TERMINAL // SECURE_LINE</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
