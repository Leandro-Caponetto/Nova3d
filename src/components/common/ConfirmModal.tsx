import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  theme?: 'dark' | 'light';
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'ELIMINAR_NODO', 
  cancelText = 'ABORTAR_ACCIÓN', 
  theme = 'dark' 
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "relative w-full max-w-md rounded-[32px] border p-8 shadow-2xl overflow-hidden",
              theme === 'dark' ? "bg-zinc-900 border-pink-500/10" : "bg-white border-zinc-200"
            )}
          >
            {/* Warning Background Glow */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-[60px] animate-pulse" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-500/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="mb-6 p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20">
                <AlertTriangle className="w-8 h-8 text-pink-500 animate-pulse" />
              </div>
              
              <h3 className={cn(
                "text-xl font-black uppercase tracking-tighter italic mb-4",
                theme === 'dark' ? "text-white" : "text-zinc-900"
              )}>
                {title}
              </h3>
              
              <p className={cn(
                "text-xs leading-relaxed font-medium mb-10 opacity-70",
                theme === 'dark' ? "text-zinc-400" : "text-zinc-600"
              )}>
                {message}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={onClose}
                  className={cn(
                    "py-4 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] transition-all",
                    theme === 'dark' ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  )}
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="py-4 rounded-xl bg-pink-600 text-white font-black uppercase text-[9px] tracking-[0.2em] hover:bg-pink-700 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all active:scale-95"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
