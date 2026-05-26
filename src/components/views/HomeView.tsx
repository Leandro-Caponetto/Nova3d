import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles, ArrowRight, MessageCircle, Check, Megaphone, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Stat } from '../common/Stat';
import { TestimonialsSection } from './TestimonialsSection';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';

export function HomeView({ onExplore, onQuote, t, theme, user, products, onWhatsApp, onSubscribe }: { 
  onExplore: () => void, 
  onQuote: () => void,
  t: any, 
  theme: 'dark' | 'light', 
  user: any, 
  products: Product[], 
  onWhatsApp: (p: Product | any) => void,
  onSubscribe: (plan: any) => void
}) {
  const [news, setNews] = useState<any[]>([]);
  const featured = products?.slice(0, 3) || [];

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setNews(data);
    };
    fetchNews();
  }, []);

  const handleWhatsAppNews = (item: any) => {
    const phoneNumber = "5491169442108";
    const text = encodeURIComponent(`Hola! Vi la novedad "${item.title}" y me interesa consultar por más info.`);
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Background Layer (Cleaned up, GIF removed) */}
        <div className={cn("absolute inset-0 z-0", theme === 'dark' ? "bg-black" : "bg-white")}>
          <div className={cn("absolute inset-0", 
            theme === 'dark' 
              ? "bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.05),transparent_50%)]" 
              : "bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.03),transparent_50%)]"
          )} />
          <div className="absolute inset-0 technical-grid opacity-10" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-32 text-center relative z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-10 px-6 py-2 rounded-xl border border-primary/40 bg-primary/10 text-primary text-[9px] font-black tracking-[0.4em] uppercase backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <span className="flex items-center gap-3">
              <Sparkles className="w-3 h-3 animate-pulse" /> {t.heroSub}
            </span>
          </motion.div>
          
          <h1 className="text-6xl md:text-[140px] font-light tracking-tighter mb-10 leading-[0.82] uppercase relative transition-all">
            {t.heroTitle1} <br />
            <span className="font-black italic text-primary drop-shadow-[0_0_30px_rgba(245,158,11,0.5)] glow-text animate-pulse">{t.heroTitle2}</span>
          </h1>
          
          <p className={cn("max-w-2xl mx-auto text-base mb-16 tracking-wide leading-relaxed font-medium transition-colors",
            theme === 'dark' ? "text-zinc-400" : "text-zinc-600")}>
            {t.heroDesc}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <button 
              onClick={onExplore}
              className="bg-primary text-white px-12 py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center gap-4 group shadow-[0_20px_50px_rgba(245,158,11,0.4)] hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-4">
                {t.explore} <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
            <button 
              onClick={onQuote}
              className={cn("px-12 py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border flex items-center gap-4 backdrop-blur-md",
              theme === 'dark' ? "border-white/10 hover:bg-white/5 text-white" : "border-zinc-200 hover:bg-zinc-50 text-black")}>
              {t.customQuote}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Novedades Section */}
      <AnimatePresence>
        {news.length > 0 && (
          <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                      <Megaphone className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">NEWS_FLASH</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                    Últimas <br/> <span className="text-zinc-500 font-light">Novedades</span>
                  </h2>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-3 bg-zinc-500/5 px-6 py-3 rounded-2xl border border-zinc-500/10">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Actualizado hoy
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {news.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className={cn(
                      "group relative rounded-[3rem] overflow-hidden border transition-all duration-500",
                      theme === 'dark' 
                        ? "bg-zinc-900 border-white/5 hover:border-primary/30" 
                        : "bg-white border-zinc-100 shadow-xl shadow-zinc-200/50 hover:border-primary/30"
                    )}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Badge */}
                      <div className="absolute top-6 left-6 z-10 px-3 py-1 bg-primary text-white rounded-lg text-[8px] font-black tracking-widest uppercase shadow-lg shadow-primary/20">
                        NUEVO
                      </div>
                    </div>

                    <div className="p-10">
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-4">{item.title}</h4>
                      <p className={cn("text-sm font-medium mb-8 leading-relaxed line-clamp-3",
                        theme === 'dark' ? "text-zinc-500" : "text-zinc-500")}>
                        {item.description}
                      </p>
                      
                      <button 
                        onClick={() => handleWhatsAppNews(item)}
                        className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:-translate-y-1 active:scale-95"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {item.button_text || 'CONSULTAR POR WHATSAPP'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-16 py-20 border-y",
          theme === 'dark' ? "border-primary/10" : "border-zinc-100")}>
          <Stat label={t.totalPrints} value="2.4k+" theme={theme} />
          <Stat label={t.materials} value="12+" theme={theme} />
          <Stat label={t.activeGateways} value={t.statsLive} theme={theme} />
          <Stat label={t.globalShipping} value={t.statsActive} theme={theme} />
        </div>
      </div>

      {/* Featured Section */}
      {featured.length > 0 && (
        <section className="py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
            <div className="flex justify-between items-end w-full mb-20">
              <div className="max-w-xl">
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">{t.curatedWorks}</span>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase italic leading-[0.9]">
                  {t.featuredTitle1} <br/> <span className="text-zinc-500">{t.featuredTitle2}</span>
                </h2>
              </div>
              <button 
                onClick={onExplore}
                className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors group"
              >
                {t.viewFullCatalog} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
              {featured.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={cn("group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border cursor-pointer",
                    theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-100")}
                  onClick={onExplore}
                >
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />

                  {/* Watermark Overlay */}
                  <div className="absolute top-6 left-6 z-10 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 pointer-events-none">
                    <span className="text-[9px] font-black tracking-tighter uppercase text-white">
                      NOVA<span className="text-primary glow-text">3D</span>
                    </span>
                  </div>

                  {/* Promo Banner for Keychains */}
                  {(product.name.toLowerCase().includes('llavero') || product.category.toLowerCase().includes('llavero') || product.id.includes('llavero') || product.name.toLowerCase().includes('pulpo') || product.name.toLowerCase().includes('harry potter')) && (
                    <div className="absolute top-20 left-0 z-10 bg-red-600 px-6 py-2.5 rounded-r-2xl border-y border-r border-white/30 shadow-[0_10px_30px_rgba(220,38,38,0.5)] animate-pulse">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white leading-none mb-1">PROMO MAYORISTA</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[14px] font-black uppercase tracking-tighter text-white leading-none">1000u</span>
                          <span className="text-[11px] font-bold text-white/90">al</span>
                          <span className="text-[18px] font-black italic text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">50%</span>
                          <span className="text-[10px] font-bold text-white/80">C/U</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  {/* WhatsApp Button Floating */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onWhatsApp(product); }}
                    className="absolute top-6 right-6 z-10 w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-transform"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-10 left-10 right-10">
                    <span className="text-primary text-[8px] font-black uppercase tracking-[0.3em] mb-2 block">{product.category}</span>
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">{product.name}</h4>
                    <div className="flex items-center justify-between overflow-hidden">
                      <span className="text-zinc-400 text-[10px] font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-y-4 group-hover:translate-y-0 duration-500">
                        GET_STRICT_QUOTATION
                      </span>
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500 shadow-xl">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button 
              onClick={onExplore}
              className="mt-16 flex md:hidden items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors"
            >
              {t.viewFullCatalog} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* Mercado Libre Promotion Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={cn("relative overflow-hidden rounded-[3rem] border p-8 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12",
              theme === 'dark' 
                ? "bg-zinc-900/50 border-white/5" 
                : "bg-white border-zinc-100 shadow-xl shadow-zinc-200/50")}
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FFE600]/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="flex-1 text-center md:text-left z-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#FFE600] text-black text-[10px] font-black uppercase tracking-widest mb-8 shadow-lg shadow-[#FFE600]/20">
                <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full">
                  <img 
                    src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.65/mercadolibre/logo__small.png" 
                    alt="ML" 
                    className="h-3"
                    referrerPolicy="no-referrer"
                  />
                </div>
                Tienda Oficial
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-6 leading-none">
                Encontranos en <br/>
                <span className="text-[#3483FA]">Mercado Libre</span>
              </h2>
              <p className={cn("text-lg mb-10 max-w-lg leading-relaxed", theme === 'dark' ? "text-zinc-400" : "text-zinc-500")}>
                Explorá nuestro catálogo completo con la seguridad y respaldo de Mercado Libre. Envíos a todo el país y cuotas sin interés.
              </p>
              <a 
                href="https://www.mercadolibre.com.ar/up/MLAU3981500636?offer_type=BEST_PRICE&pdp_filters=item_id:MLA3334908658&matt_tool=89488245#origin=share&sid=share&wid=MLA3334908658&action=copy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-[#3483FA] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#2968C8] transition-all shadow-[0_15px_40px_rgba(52,131,250,0.3)] hover:-translate-y-1 active:scale-95 group"
              >
                Visitar Tienda <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </a>
            </div>

            <div className="flex-1 relative flex justify-center items-center">
              <div className="absolute w-64 h-64 bg-[#FFE600] rounded-full blur-[80px] opacity-20 animate-pulse" />
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="relative p-8 bg-white rounded-[2.5rem] shadow-2xl border border-white/20 flex items-center justify-center">
                  <img 
                    src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.65/mercadolibre/logo__large.png" 
                    alt="Mercado Libre Logo" 
                    className="w-48 md:w-64 h-auto"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback if image fails again
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<span class="text-4xl font-black text-[#3483FA]">MERCADO LIBRE</span>');
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Raffle & Subscription Section */}
      <section className="py-32 relative overflow-hidden bg-black">
        {/* Abstract background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block"
            >
              CLUB DE BENEFICIOS
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white mb-6"
            >
              SUSCRIBITE Y <span className="text-primary italic">GANÁ</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed"
            >
              Unite a nuestra comunidad VIP. Todos los meses recibís tu número de la suerte por <span className="text-white font-bold">Mail y WhatsApp</span> para participar por productos a elección.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                name: 'BRONCE', 
                price: '15.000', 
                numbers: 1, 
                color: 'text-zinc-400',
                benefits: ['1 Número de Sorteo', 'Descuento 5% en Galería', 'Acceso a Comunidad Member'] 
              },
              { 
                name: 'PLATA', 
                price: '20.000', 
                numbers: 2, 
                color: 'text-zinc-300',
                recommended: true,
                benefits: ['2 Números de Sorteo', 'Descuento 10% en Galería', 'Acceso Anticipado a Lanzamientos', 'Soporte Preferencial'] 
              },
              { 
                name: 'ORO', 
                price: '30.000', 
                numbers: 5, 
                color: 'text-primary',
                benefits: ['5 Números de Sorteo', 'Descuento 20% en Galería', '1 Personalización Gratis al mes', 'Envíos Prioritarios'] 
              },
              { 
                name: 'PLATINO', 
                price: '60.000', 
                numbers: 12, 
                color: 'text-white',
                isVip: true,
                benefits: ['12 Números de Sorteo', 'Descuento 35% Global', 'Consultoría de Diseño 3D', 'Regalo sorpresa físico el 1er mes', 'Mención en Galería VIP'] 
              }
            ].map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "relative flex flex-col p-8 rounded-[2.5rem] border bg-zinc-900/40 backdrop-blur-xl transition-all duration-500 hover:-translate-y-4",
                  plan.recommended ? "border-primary/40 ring-1 ring-primary/20 scale-105 z-20" : "border-white/5 hover:border-white/20",
                  plan.isVip ? "shadow-[0_0_50px_rgba(255,255,255,0.05)] border-white/10" : ""
                )}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Recomendado
                  </div>
                )}
                
                <h3 className={cn("text-xs font-black tracking-[0.3em] mb-2", plan.color)}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-white text-4xl font-black tracking-tighter">${plan.price}</span>
                  <span className="text-zinc-500 text-sm font-medium">/mes</span>
                </div>

                <div className="flex flex-col gap-4 mb-10 flex-1">
                  {plan.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-zinc-400 text-sm font-medium leading-tight">{benefit}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    onSubscribe(plan);
                  }}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 group flex items-center justify-center gap-2",
                    plan.recommended 
                      ? "bg-primary text-white shadow-primary/20 hover:bg-primary-light" 
                      : "bg-white text-black hover:bg-zinc-200 shadow-white/5"
                  )}
                >
                  Suscribirme <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 flex flex-col md:flex-row items-center gap-10 max-w-4xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold text-white mb-2 uppercase italic tracking-tight">Tu número de la suerte 24/7</h4>
              <p className="text-zinc-500 text-sm">Al confirmar tu suscripción, el sistema genera automáticamente un identificador para los sorteos mensuales de <span className="text-white font-bold">productos a elección</span>. Recibirás tu comprobante digital instantáneamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <div className={cn("border-y", theme === 'dark' ? "border-primary/5 bg-primary/[0.02]" : "border-zinc-100 bg-zinc-50/50")}>
        <TestimonialsSection user={user} theme={theme} t={t} />
      </div>
    </div>
  );
}
