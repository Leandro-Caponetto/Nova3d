import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Play, RotateCcw, Sparkles, Film, Radio, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FeaturedVideoSectionProps {
  theme: 'dark' | 'light';
}

export function FeaturedVideoSection({ theme }: FeaturedVideoSectionProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(15); // Default soft / tenue volume 15%
  const [isPlaying, setIsPlaying] = useState(true);

  // Send commands to YouTube IFrame API via postMessage
  const sendYoutubeCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: func,
          args: args
        }),
        '*'
      );
    }
  };

  const toggleSound = () => {
    if (isMuted) {
      sendYoutubeCommand('unMute');
      sendYoutubeCommand('setVolume', [volume]);
      setIsMuted(false);
    } else {
      sendYoutubeCommand('mute');
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    sendYoutubeCommand('setVolume', [newVol]);
    if (isMuted && newVol > 0) {
      sendYoutubeCommand('unMute');
      setIsMuted(false);
    }
  };

  const reloadVideo = () => {
    sendYoutubeCommand('seekTo', [0, true]);
    sendYoutubeCommand('playVideo');
    setIsPlaying(true);
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-10 w-[300px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
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
              VIDEO_SHOWCASE_LOOP <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none mb-4"
          >
            Impresión <span className="text-primary glow-text">3D en Acción</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            viewport={{ once: true }}
            className={cn("text-xs md:text-sm font-medium max-w-xl",
              theme === 'dark' ? "text-zinc-400" : "text-zinc-600"
            )}
          >
            Observa el proceso de fabricación aditiva con reproducción continua y sonido ambiente tenue configurable.
          </motion.p>
        </div>

        {/* Video Player Frame Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className={cn(
            "relative rounded-3xl md:rounded-[2.5rem] overflow-hidden border p-2 md:p-3 shadow-2xl transition-all",
            theme === 'dark' 
              ? "bg-zinc-900/90 border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)]" 
              : "bg-white/90 border-zinc-200 shadow-[0_25px_60px_rgba(0,0,0,0.1)]"
          )}
        >
          {/* Top Control Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 mb-2 rounded-2xl bg-zinc-950/80 text-white backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 hidden sm:inline-block">
                NOVA3D_STREAM // XB0e7pI3Q8I
              </span>
            </div>

            {/* Audio Controls (Soft volume / Tenue) */}
            <div className="flex items-center gap-4">
              {/* Soft Volume Slider */}
              <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1 rounded-xl border border-white/10">
                <button
                  onClick={toggleSound}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  title={isMuted ? "Activar Sonido Tenue" : "Silenciar"}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-400 text-[10px] uppercase font-mono hidden xs:inline">Sin Sonido</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-[10px] font-mono font-bold uppercase">Sonido Tenue ({volume}%)</span>
                    </>
                  )}
                </button>

                <input
                  type="range"
                  min="1"
                  max="40"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  title="Ajustar volumen tenue (1% - 40%)"
                />
              </div>

              {/* Loop Restart Button */}
              <button
                onClick={reloadVideo}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                title="Reiniciar reproducción continua"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* YouTube direct link */}
              <a
                href="https://www.youtube.com/watch?v=XB0e7pI3Q8I"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all flex items-center gap-1 text-[10px] font-bold"
                title="Ver en YouTube"
              >
                <Film className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">YouTube</span>
              </a>
            </div>
          </div>

          {/* Video Container (16:9 Aspect Ratio) */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
            <iframe
              ref={iframeRef}
              className="absolute inset-0 w-full h-full border-0 rounded-2xl"
              src="https://www.youtube.com/embed/XB0e7pI3Q8I?si=kNgJdGbBYSxMBOGv&autoplay=1&mute=1&loop=1&playlist=XB0e7pI3Q8I&enablejsapi=1&controls=1&modestbranding=1&rel=0"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />

            {/* Muted overlay badge if muted */}
            {isMuted && (
              <div 
                onClick={toggleSound}
                className="absolute bottom-4 left-4 z-20 cursor-pointer bg-black/80 hover:bg-black/90 text-white backdrop-blur-md border border-amber-500/40 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-xl transition-all hover:scale-105 active:scale-95 group/btn"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 group-hover/btn:text-amber-300">
                    Activar Sonido Tenue
                  </div>
                  <div className="text-[9px] text-zinc-400 font-mono">
                    Volumen suave al {volume}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Reproducción continua activada // Nova3D Production Line</span>
            </div>
            <div className="text-zinc-500">
              HD 1080p • Bucle Automático
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
