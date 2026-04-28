import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Zap, Send } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ChatAssistant({ 
  isOpen, setIsOpen, messages, inputText, setInputText, handleSendMessage, isLoadingChat, chatEndRef, theme, t 
}: any) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn("border w-[350px] h-[500px] mb-4 rounded-2xl flex flex-col shadow-2xl overflow-hidden",
              theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200")}
          >
            <div className={cn("p-4 border-b flex items-center justify-between",
              theme === 'dark' ? "border-white/10 bg-primary/5" : "border-zinc-200 bg-primary/5")}>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest italic tracking-tighter">Nova Industrial OS</span>
              </div>
              <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 hover:text-primary transition-all" /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-zinc-500 mt-20">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-20 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Nova Core Operational</p>
                </div>
              )}
              {messages.map((m: any, idx: number) => (
                <div key={idx} className={cn("max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed", 
                  m.role === 'user' 
                    ? (theme === 'dark' ? "bg-white/5 ml-auto text-zinc-300" : "bg-zinc-100 ml-auto text-zinc-800") 
                    : "bg-primary/10 border border-primary/20 mr-auto text-primary-dark dark:text-primary")}>
                  {m.parts[0].text}
                </div>
              ))}
              {isLoadingChat && <div className="text-[10px] font-black text-primary animate-pulse tracking-[0.3em] uppercase">{t.processing}</div>}
              <div ref={chatEndRef} />
            </div>

            <div className={cn("p-4 border-t", theme === 'dark' ? "border-white/10 bg-black/20" : "border-zinc-200 bg-gray-50")}>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="relative"
              >
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.askNova}
                  className={cn("w-full border rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:border-primary transition-all text-xs font-bold tracking-tight",
                    theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-zinc-300")}
                />
                <button type="submit" className="absolute right-2 top-2 p-1.5 text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn("rounded-full p-5 shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all active:scale-95 group border-2",
          theme === 'dark' ? "bg-bg-base border-white/10 text-primary hover:border-primary" : "bg-white border-zinc-200 text-primary hover:border-primary")}
      >
        <Bot className="w-7 h-7 group-hover:rotate-[15deg] transition-transform duration-500" />
      </button>
    </div>
  );
}
