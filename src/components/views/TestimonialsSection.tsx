import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { MessageSquare, Star, Send, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Testimonial } from '../../types';
import { AlertModal } from '../common/AlertModal';

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'h1',
    user_id: 'sys1',
    user_name: 'ALEX_VANCE',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    content: 'La precisión en las piezas de resina es de otro nivel. Las tolerancias son perfectas para ensambles técnicos.',
    rating: 5,
    created_at: new Date('2024-03-10').toISOString()
  },
  {
    id: 'h2',
    user_id: 'sys2',
    user_name: 'MORGAN_ENG',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan',
    content: 'El soporte técnico me ayudó a elegir el material PETG-CF ideal para mi proyecto térmico. Servicio impecable.',
    rating: 5,
    created_at: new Date('2024-03-15').toISOString()
  },
  {
    id: 'h3',
    user_id: 'sys3',
    user_name: 'CARTER_DEZ',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carter',
    content: 'Diseños que cobran vida. El acabado seda del PLA es espectacular para piezas de exhibición.',
    rating: 4,
    created_at: new Date('2024-03-18').toISOString()
  },
  {
    id: 'h4',
    user_id: 'sys4',
    user_name: 'REED_SOLUTIONS',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Reed',
    content: 'Impresionante velocidad de entrega y calidad constante. Ideal para prototipos rápidos bajo demanda.',
    rating: 5,
    created_at: new Date('2024-03-20').toISOString()
  }
];

export function TestimonialsSection({ user, theme, t }: any) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ open: boolean; title: string; message: string; type: 'error' | 'success' | 'info' }>({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const [hoverRating, setHoverRating] = useState(0);

  async function fetchTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTestimonials([...data, ...INITIAL_TESTIMONIALS]);
    } else {
      setTestimonials(INITIAL_TESTIMONIALS);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setAlert({
        open: true,
        title: 'ACCESS_RESTRICTED',
        message: 'Please login to leave an operational report in the network.',
        type: 'error'
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('testimonials').insert({
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        content,
        rating
      });
      if (error) throw error;
      
      setAlert({
        open: true,
        title: 'PROTOCOL_SYNC_SUCCESS',
        message: 'Your Intel has been successfully transmitted and logged in our secure database.',
        type: 'success'
      });

      setContent('');
      setRating(5);
      fetchTestimonials();
    } catch (err: any) {
      setAlert({
        open: true,
        title: 'SYNC_FAILURE',
        message: err.message || 'The network encountered an error while transmitting your data. Ensure the database tables are properly initialized.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  // Duplicate testimonials for infinite scroll effect
  const marqueeItems = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-32 overflow-hidden flex flex-col items-center w-full">
      <div className="flex flex-col items-center mb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="inline-block mb-6 px-5 py-1.5 rounded-full border border-primary/10 bg-primary/[0.03] text-primary/60 text-[8px] font-black tracking-[0.5em] uppercase"
        >
          {t.networkFeedback || 'NETWORK_FEEDBACK'}
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-light uppercase tracking-tighter italic text-center mb-6">
          CLIENT_<span className="text-primary font-black italic">PROTOCOLS</span>
        </h2>
        <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Full Width Marquee - Elegant Slow Motion */}
      <div className="w-full relative mb-32 opacity-90 hover:opacity-100 transition-opacity">
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-bg-base via-bg-base/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-bg-base via-bg-base/80 to-transparent z-10 pointer-events-none" />

        <div className="flex w-fit whitespace-nowrap">
          <motion.div 
            className="flex gap-10 px-10"
            animate={{ x: [0, -2500] }}
            transition={{ 
              duration: 60, 
              repeat: Infinity, 
              ease: "linear",
              repeatType: "loop"
            }}
          >
            {marqueeItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className={cn("min-w-[350px] md:min-w-[450px] p-10 rounded-[40px] border relative flex flex-col h-full transition-all duration-700 bg-zinc-950/20 backdrop-blur-sm",
                  theme === 'dark' ? "border-white/[0.03] hover:border-primary/20" : "border-zinc-100 hover:border-primary/20")}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-full grayscale hover:grayscale-0 transition-all border border-white/5 overflow-hidden shrink-0">
                      <img src={item.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`} alt="User" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black italic uppercase tracking-widest mb-1 text-primary/80">{item.user_name}</h4>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-2 h-2", i < item.rating ? "text-yellow-400/80 fill-yellow-400/40" : "text-zinc-800")} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[6px] font-mono text-zinc-700 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p className={cn("text-[11px] leading-relaxed italic font-light tracking-wide flex-grow opacity-60 group-hover:opacity-100", theme === 'dark' ? "text-zinc-300" : "text-zinc-500")}>
                  "{item.content}"
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Submission Form Below - Ultra Subtle */}
      <div className="w-full max-w-xl px-6">
        <div className={cn("p-12 rounded-[50px] border shadow-sm relative overflow-hidden transition-all duration-1000",
          theme === 'dark' ? "bg-zinc-950/[0.15] border-white/[0.02] hover:border-primary/5" : "bg-white border-zinc-50")}
        >
          <div className="flex flex-col items-center mb-12">
            <span className="text-[7px] font-black uppercase tracking-[1em] text-zinc-700 mb-2">OPERATIONAL_INTEL</span>
            <div className="h-[1px] w-6 bg-primary/10" />
          </div>

          {user ? (
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-primary/10 p-0.5 opacity-60">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      className="w-full h-full rounded-full bg-zinc-900" 
                      alt="Avatar"
                    />
                  </div>
                  <p className="text-[9px] font-black italic uppercase tracking-widest text-primary/50">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                </div>

                <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Star 
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        className={cn("w-5 h-5 cursor-pointer transition-all duration-300",
                          star <= (hoverRating || rating) 
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" 
                            : "text-zinc-800 hover:text-zinc-600")}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="PROPOSE_FEEDBACK..."
                className={cn("w-full border-b rounded-none p-0 pb-6 text-sm md:text-base font-light tracking-wide focus:outline-none focus:border-primary/40 transition-all h-24 placeholder:opacity-10 bg-transparent resize-none",
                  theme === 'dark' ? "border-white/[0.08] text-zinc-200" : "border-zinc-200 text-zinc-800")}
              />

              <button 
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.6em] transition-all duration-500 flex items-center justify-center gap-4 group relative overflow-hidden",
                  theme === 'dark' 
                    ? "bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white" 
                    : "bg-zinc-950 text-white hover:bg-zinc-800"
                )}
              >
                <span className="relative z-10">{loading ? 'UPLOADING...' : 'TRANSMIT_DATA'}</span>
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-[7px] font-black uppercase tracking-[0.5em] text-zinc-800 italic">
                AUTHENTICATION_REQUIRED
              </p>
            </div>
          )}
        </div>
      </div>

      <AlertModal 
        isOpen={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        theme={theme}
      />
    </section>
  );
}
