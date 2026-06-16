import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, ArrowUpRight, X, MessageCircle, FileText, Sparkles, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BLOG_ARTICLES, BlogArticle } from '../../data/blog';

interface BlogSectionProps {
  theme: 'dark' | 'light';
  onWhatsApp: (msg: string) => void;
}

export function BlogSection({ theme, onWhatsApp }: BlogSectionProps) {
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);

  const handleShareOnWhatsApp = (article: BlogArticle) => {
    const text = `¡Hola! Estaba leyendo el artículo "${article.title}" en Nova3D y me interesó muchísimo consultar por un diseño similar.`;
    onWhatsApp(text);
  };

  return (
    <section id="blog-seo-section" className="py-32 relative overflow-hidden">
      {/* Visual background glows to complement the cyber theme */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-4 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-[9px] font-black uppercase tracking-[0.4em]">NOVA3D_KNOWLEDGE_BASE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic mb-6 leading-none"
          >
            Blog & <span className="text-zinc-500 font-light italic">Novedades 3D</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className={cn(
              "text-sm md:text-base max-w-2xl mx-auto leading-relaxed",
              theme === 'dark' ? "text-zinc-400" : "text-zinc-600"
            )}
          >
            Explorá guías completas de fabricación aditiva, análisis de costos en Argentina y tutoriales interactivos para optimizar tus impresiones. Conectando buscadores directo a resultados.
          </motion.p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {BLOG_ARTICLES.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              onClick={() => setSelectedArticle(article)}
              className={cn(
                "group cursor-pointer flex flex-col rounded-[2.5rem] overflow-hidden border transition-all duration-500",
                theme === 'dark'
                  ? "bg-zinc-900/40 border-white/5 hover:border-primary/40 hover:bg-zinc-900/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
                  : "bg-white border-zinc-100 hover:border-primary/40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)]"
              )}
            >
              {/* Card visual / Image container */}
              <div className="aspect-[16/10] relative overflow-hidden bg-zinc-950">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity group-hover:opacity-75" />
                
                {/* Visual Category Label */}
                <div className="absolute top-6 left-6 z-10">
                  <span className="px-3.5 py-1 backdrop-blur-md bg-black/40 text-[9px] font-black uppercase tracking-wider text-primary border border-primary/20 rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-[10px] font-mono mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{article.readTime}</span>
                  </div>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight italic mb-3 leading-snug group-hover:text-primary transition-colors">
                  {article.title}
                </h3>

                <p className={cn(
                  "text-xs md:text-sm leading-relaxed mb-6 font-medium line-clamp-3",
                  theme === 'dark' ? "text-zinc-500" : "text-zinc-400"
                )}>
                  {article.excerpt}
                </p>

                {/* Card CTA Link */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-zinc-500/10">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                    LEER_ARTÍCULO_COMPLETO
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reader Overlap Modal */}
        <AnimatePresence>
          {selectedArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
              {/* Dim backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedArticle(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              {/* Main Dialog Window */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={cn(
                  "relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[2.5rem] overflow-hidden border shadow-2xl z-10",
                  theme === 'dark' ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-950"
                )}
              >
                {/* Header Banner */}
                <div className="relative h-48 md:h-72 w-full overflow-hidden flex-shrink-0 bg-zinc-900">
                  <img
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/40" />

                  {/* Dismiss Floating Button */}
                  <button
                    onClick={() => setSelectedArticle(null)}
                    aria-label="Close modal"
                    className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border border-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Header Title Information overlayed on bottom */}
                  <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 right-6 md:right-10 z-10">
                    <span className="inline-block mb-3 px-3 py-1 text-[9px] font-black uppercase tracking-wider bg-primary text-white rounded-full">
                      {selectedArticle.category}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-white line-clamp-2 leading-none">
                      {selectedArticle.title}
                    </h2>
                  </div>
                </div>

                {/* Sub-Header Stats strip */}
                <div className={cn(
                  "flex items-center justify-between px-6 md:px-10 py-5 border-b text-[10px] font-mono flex-shrink-0",
                  theme === 'dark' ? "border-white/5 bg-zinc-900/30" : "border-zinc-100 bg-zinc-50"
                )}>
                  <div className="flex items-center gap-4 text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {selectedArticle.readTime}
                    </span>
                    <span>•</span>
                    <span>{selectedArticle.date}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-500/10 text-zinc-500 dark:text-zinc-400">
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    <span>SEO_VERIFIED</span>
                  </div>
                </div>

                {/* Scrollable Article Body Content */}
                <div className="overflow-y-auto p-6 md:p-12 space-y-8 flex-1 leading-relaxed text-sm md:text-base">
                  {selectedArticle.content.map((block, bIdx) => {
                    switch (block.type) {
                      case 'paragraph':
                        return (
                          <p key={bIdx} className={cn(theme === 'dark' ? "text-zinc-300" : "text-zinc-600", "font-medium")}>
                            {block.text}
                          </p>
                        );
                      case 'heading':
                        return (
                          <h3 key={bIdx} className="text-xl md:text-2xl font-black uppercase tracking-tight italic pt-4">
                            {block.text}
                          </h3>
                        );
                      case 'list':
                        return (
                          <ul key={bIdx} className="space-y-3.5 pl-2">
                            {block.items?.map((item, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className={theme === 'dark' ? "text-zinc-350" : "text-zinc-650"}>
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        );
                      case 'highlight':
                        return (
                          <div key={bIdx} className="p-6 md:p-8 rounded-3xl bg-primary/10 border border-primary/20 flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-primary">RECOMENDACIÓN DEL EXPERTO</span>
                            <p className="text-xs md:text-sm font-bold tracking-wide italic leading-snug">
                              {block.text}
                            </p>
                          </div>
                        );
                      case 'table':
                        return (
                          <div key={bIdx} className={cn(
                            "rounded-3xl border overflow-hidden",
                            theme === 'dark' ? "border-white/5 bg-zinc-900/10" : "border-zinc-100 bg-zinc-50/50"
                          )}>
                            {block.rows?.map((row, rIdx) => (
                              <div
                                key={rIdx}
                                className={cn(
                                  "flex sm:flex-row flex-col justify-between px-6 py-4 border-b gap-1",
                                  theme === 'dark' ? "border-white/5" : "border-zinc-100",
                                  rIdx % 2 === 0 ? "bg-black/5 dark:bg-white/[0.02]" : ""
                                )}
                              >
                                <span className="font-mono text-xs text-zinc-500 uppercase">{row.label}</span>
                                <span className="font-black italic text-primary text-sm sm:text-base">{row.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}

                  {/* Keywords Tag Cloud for actual SEO look & indexing */}
                  <div className="pt-8 border-t border-dashed border-zinc-500/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">PALABRAS CLAVE ASOCIADAS</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.seoKeywords.map((kw, kwIdx) => (
                        <span key={kwIdx} className="text-[10px] font-mono px-3 py-1 rounded bg-zinc-500/10 text-zinc-500 dark:text-zinc-400">
                          #{kw.toLowerCase().replace(/\s+/g, '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className={cn(
                  "p-6 md:p-10 border-t flex flex-col sm:flex-row items-center justify-between gap-6 flex-shrink-0",
                  theme === 'dark' ? "border-white/5 bg-zinc-950" : "border-zinc-100 bg-white"
                )}>
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-bold uppercase tracking-tight">¿Te sirvió esta información?</h4>
                    <p className="text-xs text-zinc-500 font-medium">Hablá hoy mismo con un consultor para encargar tu pieza en 3D.</p>
                  </div>
                  <button
                    onClick={() => {
                      handleShareOnWhatsApp(selectedArticle);
                      setSelectedArticle(null);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Consultar por WhatsApp
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
