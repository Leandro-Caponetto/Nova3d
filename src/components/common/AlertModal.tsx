import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info';
  theme?: 'dark' | 'light';
}

export function AlertModal({ isOpen, onClose, title, message, type = 'info', theme = 'dark' }: AlertModalProps) {
  const icons = {
    error: <AlertTriangle className="w-8 h-8 text-red-500" />,
    success: <CheckCircle2 className="w-8 h-8 text-green-500" />,
    info: <Info className="w-8 h-8 text-primary" />
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "relative w-full max-w-md rounded-[32px] border p-8 shadow-2xl overflow-hidden",
              theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200"
            )}
          >
            {/* Header Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-500/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 p-4 rounded-2xl bg-zinc-500/5 border border-white/5">
                {icons[type]}
              </div>
              
              <h3 className={cn(
                "text-xl font-black uppercase tracking-tighter italic mb-4",
                theme === 'dark' ? "text-white" : "text-zinc-900"
              )}>
                {title}
              </h3>
              
              <p className={cn(
                "text-xs leading-relaxed font-medium mb-8 opacity-70",
                theme === 'dark' ? "text-zinc-400" : "text-zinc-600"
              )}>
                {message}
              </p>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl bg-primary/[0.08] border border-primary/20 text-primary font-black uppercase text-[9px] tracking-[0.4em] hover:bg-primary/[0.15] hover:border-primary/40 hover:scale-[1.02] transition-all duration-700 shadow-[0_0_20px_rgba(245,158,11,0.05)] active:scale-95 group relative overflow-hidden"
              >
                <span className="relative z-10">CONFIRM_PROTOCOL</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
