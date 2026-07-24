import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, RotateCcw, Sparkles, Film, Radio, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FeaturedVideoSectionProps {
  theme: 'dark' | 'light';
}

export function FeaturedVideoSection({ theme }: FeaturedVideoSectionProps) {
  // Video 1: Propaganda del Producto Nova3D (_vmwfiPIhJ8)
  const iframeRef1 = useRef<HTMLIFrameElement>(null);
  const [isMuted1, setIsMuted1] = useState(true);
  const [volume1, setVolume1] = useState(18);

  // Video 2: Impresión 3D Proceso (XB0e7pI3Q8I)
  const iframeRef2 = useRef<HTMLIFrameElement>(null);
  const [isMuted2, setIsMuted2] = useState(true);
  const [volume2, setVolume2] = useState(18);

  // Active view tab mode: 'both' | 'propaganda' | 'process'
  const [activeTab, setActiveTab] = useState<'both' | 'propaganda' | 'process'>('both');

  const sendCommand = (ref: React.RefObject<HTMLIFrameElement | null>, func: string, args: any[] = []) => {
    if (ref.current && ref.current.contentWindow) {
      ref.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: func,
          args: args
        }),
        '*'
      );
    }
  };

  // Video 1 Handlers
  const toggleSound1 = () => {
    if (isMuted1) {
      sendCommand(iframeRef1, 'unMute');
      sendCommand(iframeRef1, 'setVolume', [volume1]);
      setIsMuted1(false);
    } else {
      sendCommand(iframeRef1, 'mute');
      setIsMuted1(true);
    }
  };

  const handleVolumeChange1 = (vol: number) => {
    setVolume1(vol);
    sendCommand(iframeRef1, 'setVolume', [vol]);
    if (isMuted1 && vol > 0) {
      sendCommand(iframeRef1, 'unMute');
      setIsMuted1(false);
    }
  };

  const reload1 = () => {
    sendCommand(iframeRef1, 'seekTo', [0, true]);
    sendCommand(iframeRef1, 'playVideo');
  };

  // Video 2 Handlers
  const toggleSound2 = () => {
    if (isMuted2) {
      sendCommand(iframeRef2, 'unMute');
      sendCommand(iframeRef2, 'setVolume', [volume2]);
      setIsMuted2(false);
    } else {
      sendCommand(iframeRef2, 'mute');
      setIsMuted2(true);
    }
  };

  const handleVolumeChange2 = (vol: number) => {
    setVolume2(vol);
    sendCommand(iframeRef2, 'setVolume', [vol]);
    if (isMuted2 && vol > 0) {
      sendCommand(iframeRef2, 'unMute');
      setIsMuted2(false);
    }
  };

  const reload2 = () => {
    sendCommand(iframeRef2, 'seekTo', [0, true]);
    sendCommand(iframeRef2, 'playVideo');
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-[350px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header Badge & Title */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.35em] mb-4 shadow-lg shadow-primary/5"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
            <span className="flex items-center gap-2">
              SHOWCASE_CINEMÁTICO <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none mb-4"
          >
            Propaganda <span className="text-primary glow-text">& Demostración en Video</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            viewport={{ once: true }}
            className={cn("text-xs md:text-sm font-medium max-w-2xl mb-8",
              theme === 'dark' ? "text-zinc-400" : "text-zinc-600"
            )}
          >
            Disfruta de nuestros dos videos promocionales en bucle continuo con sonido tenue regulable para cada video.
          </motion.p>

          {/* Tab Filter Selector */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-xl">
            <button
              onClick={() => setActiveTab('both')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                activeTab === 'both'
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Layers className="w-3.5 h-3.5" /> Ver Ambos Videos
            </button>

            <button
              onClick={() => setActiveTab('propaganda')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                activeTab === 'propaganda'
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Film className="w-3.5 h-3.5" /> Propaganda Producto
            </button>

            <button
              onClick={() => setActiveTab('process')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                activeTab === 'process'
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" /> Impresión 3D en Acción
            </button>
          </div>
        </div>

        {/* Vertical Stacked Layout for Videos (One below the other with separation) */}
        <div className="flex flex-col gap-12 md:gap-16 max-w-4xl mx-auto">

          {/* VIDEO 1: Propaganda de Producto (_vmwfiPIhJ8) */}
          {(activeTab === 'both' || activeTab === 'propaganda') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "rounded-3xl overflow-hidden border p-3 md:p-4 shadow-2xl transition-all flex flex-col justify-between",
                theme === 'dark' 
                  ? "bg-zinc-950/90 border-amber-500/30 shadow-[0_20px_50px_rgba(245,158,11,0.12)]" 
                  : "bg-white border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
              )}
            >
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 mb-3 rounded-2xl bg-zinc-900 text-white border border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">
                    1. PROPAGANDA DEL PRODUCTO
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-zinc-800/90 px-3 py-1 rounded-xl border border-white/10">
                    <button
                      onClick={toggleSound1}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                    >
                      {isMuted1 ? (
                        <>
                          <VolumeX className="w-4 h-4 text-zinc-400" />
                          <span className="text-zinc-400 text-[10px] uppercase font-mono hidden xs:inline">Sin Sonido</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span className="text-emerald-400 text-[10px] font-mono font-bold uppercase">Sonido ({volume1}%)</span>
                        </>
                      )}
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={volume1}
                      onChange={(e) => handleVolumeChange1(Number(e.target.value))}
                      className="w-16 h-1 bg-zinc-600 rounded appearance-none cursor-pointer accent-primary"
                      title="Volumen tenue"
                    />
                  </div>

                  <button
                    onClick={reload1}
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                    title="Reiniciar video"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Video 1 Frame */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                <iframe
                  ref={iframeRef1}
                  className="absolute inset-0 w-full h-full border-0 rounded-2xl"
                  src="https://www.youtube.com/embed/_vmwfiPIhJ8?si=xhK6rV93nJ_6nD-R&autoplay=1&mute=1&loop=1&playlist=_vmwfiPIhJ8&enablejsapi=1&controls=1&modestbranding=1&rel=0"
                  title="Propaganda Producto Nova3D"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />

                {isMuted1 && (
                  <div 
                    onClick={toggleSound1}
                    className="absolute bottom-4 left-4 z-20 cursor-pointer bg-black/85 hover:bg-black text-white border border-amber-500/40 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-xl hover:scale-105 transition-all"
                  >
                    <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" />
                    <div>
                      <div className="text-[10px] font-black uppercase text-amber-400">Activar Sonido Tenue</div>
                      <div className="text-[9px] text-zinc-400">Volumen al {volume1}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-3 pt-3 text-xs font-mono text-zinc-400">
                <span>Comercial Oficial Nova3D</span>
                <span className="text-amber-400 font-bold">Bucle Continuo • HD 1080p</span>
              </div>
            </motion.div>
          )}

          {/* Separation Divider line if both are visible */}
          {activeTab === 'both' && (
            <div className="flex items-center justify-center gap-4 my-2">
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent flex-1" />
              <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                SEPARADOR DE VIDEOS
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent flex-1" />
            </div>
          )}

          {/* VIDEO 2: Impresión 3D en Acción (XB0e7pI3Q8I) */}
          {(activeTab === 'both' || activeTab === 'process') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "rounded-3xl overflow-hidden border p-3 md:p-4 shadow-2xl transition-all flex flex-col justify-between",
                theme === 'dark' 
                  ? "bg-zinc-950/90 border-cyan-500/30 shadow-[0_20px_50px_rgba(6,182,212,0.12)]" 
                  : "bg-white border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
              )}
            >
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 mb-3 rounded-2xl bg-zinc-900 text-white border border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
                    2. PROCESO DE IMPRESIÓN 3D EN ACCIÓN
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-zinc-800/90 px-3 py-1 rounded-xl border border-white/10">
                    <button
                      onClick={toggleSound2}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                    >
                      {isMuted2 ? (
                        <>
                          <VolumeX className="w-4 h-4 text-zinc-400" />
                          <span className="text-zinc-400 text-[10px] uppercase font-mono hidden xs:inline">Sin Sonido</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span className="text-emerald-400 text-[10px] font-mono font-bold uppercase">Sonido ({volume2}%)</span>
                        </>
                      )}
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={volume2}
                      onChange={(e) => handleVolumeChange2(Number(e.target.value))}
                      className="w-16 h-1 bg-zinc-600 rounded appearance-none cursor-pointer accent-cyan-400"
                      title="Volumen tenue"
                    />
                  </div>

                  <button
                    onClick={reload2}
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                    title="Reiniciar video"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Video 2 Frame */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                <iframe
                  ref={iframeRef2}
                  className="absolute inset-0 w-full h-full border-0 rounded-2xl"
                  src="https://www.youtube.com/embed/XB0e7pI3Q8I?si=kNgJdGbBYSxMBOGv&autoplay=1&mute=1&loop=1&playlist=XB0e7pI3Q8I&enablejsapi=1&controls=1&modestbranding=1&rel=0"
                  title="Proceso Impresora 3D Nova3D"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />

                {isMuted2 && (
                  <div 
                    onClick={toggleSound2}
                    className="absolute bottom-4 left-4 z-20 cursor-pointer bg-black/85 hover:bg-black text-white border border-cyan-500/40 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-xl hover:scale-105 transition-all"
                  >
                    <Volume2 className="w-4 h-4 text-cyan-400 animate-bounce" />
                    <div>
                      <div className="text-[10px] font-black uppercase text-cyan-400">Activar Sonido Tenue</div>
                      <div className="text-[9px] text-zinc-400">Volumen al {volume2}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-3 pt-3 text-xs font-mono text-zinc-400">
                <span>Fabricación Aditiva de Alta Precisión</span>
                <span className="text-cyan-400 font-bold">Bucle Continuo • HD 1080p</span>
              </div>
            </motion.div>
          )}

        </div>

      </div>
    </section>
  );
}
