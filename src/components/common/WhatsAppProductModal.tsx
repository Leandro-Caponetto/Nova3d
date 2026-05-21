import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageCircle, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Product } from '../../types';

interface WhatsAppProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  t: any;
  theme: 'dark' | 'light';
  onOpenChat: (p: Product) => void;
}

export function WhatsAppProductModal({ isOpen, onClose, product, t, theme, onOpenChat }: WhatsAppProductModalProps) {
  const [message, setMessage] = useState('');
  const phoneNumber = '5491169442108'; // Format: country code + area code + number

  const handleSend = () => {
    if (!product) return;
    
    const baseText = `Hola! Estoy interesado en el producto: *${product.name}*\n`;
    const imageText = `Imagen: ${product.images[0]}\n`;
    const priceText = `Precio: $${product.price.toLocaleString()}\n`;
    const userMessage = message ? `\nMi mensaje: ${message}` : '';
    
    const fullMessage = encodeURIComponent(`${baseText}${imageText}${priceText}${userMessage}`);
    window.open(`https://wa.me/${phoneNumber}?text=${fullMessage}`, '_blank');
    onClose();
    setMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn("relative w-full max-w-lg rounded-[2.5rem] overflow-hidden border shadow-2xl",
              theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200")}
          >
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between border-b border-zinc-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">MÉTODO_CONSULTA</h3>
                  <p className="text-lg font-black italic uppercase tracking-tighter">Seleccionar Protocolo</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-500/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            {/* Product Preview Short */}
            <div className="px-8 py-6">
              <div className={cn("flex items-center gap-4 p-4 rounded-3xl border",
                theme === 'dark' ? "bg-black/20 border-white/5" : "bg-zinc-50 border-zinc-100")}>
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/5">
                  <img src={product.images[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="font-black italic uppercase tracking-tighter text-sm mb-1">{product.name}</h4>
                  <p className="text-[10px] font-mono text-primary font-black uppercase tracking-widest">${product.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Selection Area */}
            <div className="p-8 pt-0 space-y-4">
              <button 
                onClick={() => { onOpenChat(product); onClose(); }}
                className="w-full bg-primary text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 group"
              >
                <MessageSquare className="w-5 h-5" /> Chat Directo (Recomendado)
              </button>

              <div className="flex items-center gap-4 px-4">
                <div className="h-px flex-grow bg-zinc-500/10" />
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">O TAMBIÉN</span>
                <div className="h-px flex-grow bg-zinc-500/10" />
              </div>
              
              <div className={cn("rounded-3xl p-6 border space-y-4",
                theme === 'dark' ? "bg-black/20 border-white/5" : "bg-zinc-50 border-zinc-200")}>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.wsMessage}
                  className={cn("w-full h-24 rounded-2xl p-4 text-xs font-medium outline-none transition-all resize-none border",
                    theme === 'dark' ? "bg-black/40 border-white/5 text-white placeholder:text-zinc-600" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400")}
                />
                <button 
                  onClick={handleSend}
                  className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-4 group"
                >
                  <MessageCircle className="w-5 h-5" /> {t.wsConsult || 'Consultar WhatsApp'}
                </button>
              </div>

              <p className="mt-6 text-[8px] text-zinc-500 text-center uppercase font-bold tracking-[0.5em] opacity-30 italic">
                Nova3D_Secure_Communication_Protocol
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
