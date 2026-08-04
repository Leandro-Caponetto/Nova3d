import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, RotateCcw, Sparkles, Film, Radio, Layers, Pause, Play, Globe } from 'lucide-react';
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

  // Slow Orbit State
  const [isOrbitPaused, setIsOrbitPaused] = useState(false);
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const [angle1, setAngle1] = useState(0.2);
  const [angle2, setAngle2] = useState(Math.PI + 0.2);

  // Responsive container width ref
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(900);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth Animation Loop for Slow Orbit
  useEffect(() => {
    let animId: number;
    const animateOrbit = () => {
      if (!isOrbitPaused && hoveredVideo === null) {
        setAngle1((prev) => (prev + 0.0007) % (Math.PI * 2));
        setAngle2((prev) => (prev + 0.0005) % (Math.PI * 2));
      }
      animId = requestAnimationFrame(animateOrbit);
    };
    animId = requestAnimationFrame(animateOrbit);
    return () => cancelAnimationFrame(animId);
  }, [isOrbitPaused, hoveredVideo]);

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

  // Orbital math calculations based on responsive screen width
  const isMobile = containerWidth < 768;
  const radiusX1 = isMobile ? Math.min(containerWidth * 0.40, 160) : Math.min(containerWidth * 0.35, 420);
  const radiusY1 = isMobile ? 65 : 135;

  const radiusX2 = isMobile ? Math.min(containerWidth * 0.46, 200) : Math.min(containerWidth * 0.43, 520);
  const radiusY2 = isMobile ? 85 : 175;

  // Moon 1 Position & Depth
  const x1 = Math.cos(angle1) * radiusX1;
  const y1 = Math.sin(angle1) * radiusY1;
  const sin1 = Math.sin(angle1);
  const scale1 = 0.82 + (sin1 + 1) * 0.10;
  const zIndex1 = sin1 > 0 ? 30 : 10;
  const opacity1 = sin1 > 0 ? 1 : 0.65;

  // Moon 2 Position & Depth
  const x2 = Math.cos(angle2) * radiusX2;
  const y2 = Math.sin(angle2) * radiusY2;
  const sin2 = Math.sin(angle2);
  const scale2 = 0.82 + (sin2 + 1) * 0.10;
  const zIndex2 = sin2 > 0 ? 30 : 10;
  const opacity2 = sin2 > 0 ? 1 : 0.65;

  return (
    <section className="py-16 md:py-28 relative overflow-hidden select-none">
      {/* Background Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-[400px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div ref={containerRef} className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header Controls */}
        <div className="flex flex-col items-center text-center mb-8 relative z-40">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.35em] mb-3 shadow-lg shadow-primary/5"
          >
            <Radio className="w-3 h-3 animate-pulse text-red-500" />
            <span className="flex items-center gap-2">
              SISTEMA_ORBITAL_LUNAR <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </span>
          </motion.div>

          {/* Filter & Orbit Speed Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab('both')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
                activeTab === 'both'
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Layers className="w-3.5 h-3.5" /> Ver Ambas Lunas
            </button>

            <button
              onClick={() => setActiveTab('propaganda')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
                activeTab === 'propaganda'
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Film className="w-3.5 h-3.5" /> Luna 1: Producto
            </button>

            <button
              onClick={() => setActiveTab('process')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
                activeTab === 'process'
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" /> Luna 2: Impresión
            </button>

            <div className="w-px h-5 bg-white/15 mx-1 hidden sm:block" />

            <button
              onClick={() => setIsOrbitPaused(!isOrbitPaused)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border",
                isOrbitPaused
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-zinc-800 text-amber-400 border-amber-500/30 hover:bg-zinc-700"
              )}
            >
              {isOrbitPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> Reanudar Órbita
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Pausar Órbita Lenta
                </>
              )}
            </button>
          </div>
        </div>

        {/* ORBITAL STAGE AREA (Planet in Center + 2 Orbiting Video Moons) */}
        <div className="relative min-h-[480px] md:min-h-[580px] flex items-center justify-center">
          
          {/* SVG Orbit Path Lines behind/around planet */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            {/* Outer Orbit Path 2 */}
            <ellipse
              cx="50%"
              cy="50%"
              rx={radiusX2}
              ry={radiusY2}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.2"
              strokeDasharray="6 8"
              opacity="0.35"
            />
            {/* Inner Orbit Path 1 */}
            <ellipse
              cx="50%"
              cy="50%"
              rx={radiusX1}
              ry={radiusY1}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="8 6"
              opacity="0.45"
            />
          </svg>

          {/* ORBITAL STAGE AREA (2 Orbiting Video Moons around 3D Planet) */}
          {/* Subtle center marker ring (transparent outline) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-amber-500/10 pointer-events-none animate-ping opacity-25" />

          {/* MOON 1: Video 1 (Propaganda Producto) */}
          {(activeTab === 'both' || activeTab === 'propaganda') && (
            <div
              onMouseEnter={() => setHoveredVideo(1)}
              onMouseLeave={() => setHoveredVideo(null)}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x1}px), calc(-50% + ${y1}px)) scale(${scale1})`,
                zIndex: zIndex1,
                opacity: opacity1,
                width: isMobile ? '280px' : '420px',
                transition: hoveredVideo === 1 ? 'transform 0.2s ease-out' : 'transform 0.05s linear, opacity 0.3s ease'
              }}
              className={cn(
                "rounded-2xl overflow-hidden border p-2 shadow-2xl backdrop-blur-md transition-all flex flex-col justify-between",
                theme === 'dark'
                  ? "bg-zinc-950/95 border-amber-500/50 shadow-[0_15px_40px_rgba(245,158,11,0.25)]"
                  : "bg-white/95 border-amber-500/40 shadow-[0_15px_40px_rgba(245,158,11,0.15)]"
              )}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-1.5 rounded-xl bg-zinc-900 text-white border border-amber-500/30">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider truncate">
                    🌙 LUNA 01: PROPAGANDA
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 bg-zinc-800/90 px-2 py-0.5 rounded-lg border border-white/10">
                    <button
                      onClick={toggleSound1}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                    >
                      {isMuted1 ? (
                        <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={volume1}
                      onChange={(e) => handleVolumeChange1(Number(e.target.value))}
                      className="w-10 h-1 bg-zinc-600 rounded appearance-none cursor-pointer accent-primary"
                      title="Volumen tenue"
                    />
                  </div>

                  <button
                    onClick={reload1}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                    title="Reiniciar video"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Video 1 Frame */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner border border-amber-500/20">
                <iframe
                  ref={iframeRef1}
                  className="absolute inset-0 w-full h-full border-0 rounded-xl"
                  src="https://www.youtube.com/embed/_vmwfiPIhJ8?si=xhK6rV93nJ_6nD-R&autoplay=1&mute=1&loop=1&playlist=_vmwfiPIhJ8&enablejsapi=1&controls=1&modestbranding=1&rel=0"
                  title="Propaganda Producto Nova3D"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />

                {isMuted1 && (
                  <div 
                    onClick={toggleSound1}
                    className="absolute bottom-2.5 left-2.5 z-20 cursor-pointer bg-black/85 hover:bg-black text-white border border-amber-500/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all"
                  >
                    <Volume2 className="w-3 h-3 text-amber-400 animate-bounce" />
                    <div>
                      <div className="text-[8.5px] font-black uppercase text-amber-400">Activar Sonido</div>
                      <div className="text-[7.5px] text-zinc-400">{volume1}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Telemetry */}
              <div className="flex items-center justify-between px-2 pt-1.5 text-[9px] font-mono text-zinc-400">
                <span className="text-amber-400/90 font-semibold">Órbita Lenta Interior</span>
                <span className="text-amber-400 font-bold">HD 1080p</span>
              </div>
            </div>
          )}

          {/* MOON 2: Video 2 (Impresión 3D en Acción) */}
          {(activeTab === 'both' || activeTab === 'process') && (
            <div
              onMouseEnter={() => setHoveredVideo(2)}
              onMouseLeave={() => setHoveredVideo(null)}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x2}px), calc(-50% + ${y2}px)) scale(${scale2})`,
                zIndex: zIndex2,
                opacity: opacity2,
                width: isMobile ? '280px' : '420px',
                transition: hoveredVideo === 2 ? 'transform 0.2s ease-out' : 'transform 0.05s linear, opacity 0.3s ease'
              }}
              className={cn(
                "rounded-2xl overflow-hidden border p-2 shadow-2xl backdrop-blur-md transition-all flex flex-col justify-between",
                theme === 'dark'
                  ? "bg-zinc-950/95 border-cyan-500/50 shadow-[0_15px_40px_rgba(6,182,212,0.25)]"
                  : "bg-white/95 border-cyan-500/40 shadow-[0_15px_40px_rgba(6,182,212,0.15)]"
              )}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-1.5 rounded-xl bg-zinc-900 text-white border border-cyan-500/30">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider truncate">
                    🌙 LUNA 02: IMPRESIÓN 3D
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 bg-zinc-800/90 px-2 py-0.5 rounded-lg border border-white/10">
                    <button
                      onClick={toggleSound2}
                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                    >
                      {isMuted2 ? (
                        <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={volume2}
                      onChange={(e) => handleVolumeChange2(Number(e.target.value))}
                      className="w-10 h-1 bg-zinc-600 rounded appearance-none cursor-pointer accent-cyan-400"
                      title="Volumen tenue"
                    />
                  </div>

                  <button
                    onClick={reload2}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                    title="Reiniciar video"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Video 2 Frame */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner border border-cyan-500/20">
                <iframe
                  ref={iframeRef2}
                  className="absolute inset-0 w-full h-full border-0 rounded-xl"
                  src="https://www.youtube.com/embed/XB0e7pI3Q8I?si=kNgJdGbBYSxMBOGv&autoplay=1&mute=1&loop=1&playlist=XB0e7pI3Q8I&enablejsapi=1&controls=1&modestbranding=1&rel=0"
                  title="Proceso Impresora 3D Nova3D"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />

                {isMuted2 && (
                  <div 
                    onClick={toggleSound2}
                    className="absolute bottom-2.5 left-2.5 z-20 cursor-pointer bg-black/85 hover:bg-black text-white border border-cyan-500/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all"
                  >
                    <Volume2 className="w-3 h-3 text-cyan-400 animate-bounce" />
                    <div>
                      <div className="text-[8.5px] font-black uppercase text-cyan-400">Activar Sonido</div>
                      <div className="text-[7.5px] text-zinc-400">{volume2}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Telemetry */}
              <div className="flex items-center justify-between px-2 pt-1.5 text-[9px] font-mono text-zinc-400">
                <span className="text-cyan-400/90 font-semibold">Órbita Lenta Exterior</span>
                <span className="text-cyan-400 font-bold">HD 1080p</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

export default FeaturedVideoSection;

