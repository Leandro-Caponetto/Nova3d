import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Instagram, MessageCircle, Send, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ContactViewProps {
  theme: 'dark' | 'light';
  t: any;
}

export function ContactView({ theme, t }: ContactViewProps) {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    setTimeout(() => {
      setLoading(false);
      const formData = new FormData(e.target as HTMLFormElement);
      const message = formData.get('message');
      const phoneNumber = "5491169442102";
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message as string)}`;
      window.open(whatsappUrl, '_blank');
    }, 1000);
  };

  return (
    <div className="min-h-screen py-24 px-4 relative overflow-hidden">
      {/* World Map Background - High Visibility Upgrade */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-40 dark:opacity-25">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg" 
            alt="World Map Silhouette" 
            className={cn(
              "w-[140%] max-w-none h-auto object-contain",
              theme === 'dark' ? "invert brightness-[3] contrast-[1.2]" : "grayscale brightness-[0.7]"
            )}
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Subtle fade to maintain readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-base/20 to-bg-base opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Contact Info & Map */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 leading-none">
                {t.contactTitle.split(' ')[0]} <span className="text-primary drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">{t.contactTitle.split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.4em] max-w-md">
                {t.contactSub}
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-center gap-6 p-6 rounded-[32px] border border-zinc-500/10 bg-black/5 dark:bg-white/5 group hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{t.contactLoc}</h4>
                  <p className="text-sm font-black uppercase tracking-tight italic">Buenos Aires, Argentina | Zona Sur</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 rounded-[32px] border border-zinc-500/10 bg-black/5 dark:bg-white/5 group hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] border border-[#25D366]/20 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{t.contactWA}</h4>
                  <p className="text-sm font-black uppercase tracking-tight italic">+54 9 11 6944-2102</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 rounded-[32px] border border-zinc-500/10 bg-black/5 dark:bg-white/5 group hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{t.contactEmail}</h4>
                  <p className="text-sm font-black uppercase tracking-tight italic">operaciones@nova3d.com</p>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative rounded-[40px] overflow-hidden border border-zinc-500/10 bg-black/50 aspect-video shadow-2xl"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105073.443670806!2d-58.53167433251914!3d-34.61566245100085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca3b4ef90af3%3A0x6091ad7446156581!2sBuenos%20Aires%2C%20Argentina!5e0!3m2!1ses!2sar!4v1714000000000!5m2!1ses!2sar"
                width="100%"
                height="100%"
                style={{ border: 0, filter: theme === 'dark' ? 'grayscale(1) invert(0.9) contrast(1.2) brightness(0.9)' : 'grayscale(0.5)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-0 grayscale transition-all duration-700"
              />
              <div className="absolute inset-0 pointer-events-none border-[20px] border-black/10 rounded-[40px]" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white">📡 SEÑAL_GPS_ACTIVA</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-12 rounded-[48px] bg-black/20 dark:bg-white/5 border border-zinc-500/10 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
            
            <div className="mb-12">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{t.contactSend}</h3>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.contactNote.split('.')[0]}.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 transition-colors group-focus-within:text-primary">{t.contactFormName}</label>
                  <input 
                    type="text" 
                    required
                    placeholder="TU_NOMBRE..."
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-xs font-black tracking-widest outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder:text-zinc-700"
                  />
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 transition-colors group-focus-within:text-primary">{t.contactFormMsg}</label>
                  <textarea 
                    name="message"
                    required
                    rows={5}
                    placeholder="ESCRIBE_TU_REQUERIMIENTO..."
                    className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-xs font-black tracking-widest outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder:text-zinc-700 resize-none"
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.5em] text-[11px] shadow-[0_15px_35px_rgba(245,158,11,0.3)] hover:shadow-[0_20px_45px_rgba(245,158,11,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.processing.toUpperCase()}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{t.contactBtn}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-8 pt-8 opacity-40">
                <Instagram className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
                <MessageCircle className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
                <Mail className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
              </div>
            </form>

            <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 leading-relaxed">
                <span className="text-primary">{t.confirmed === 'Confirmado' ? 'NOTA' : 'NOTE'}:</span> {t.contactNote}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
