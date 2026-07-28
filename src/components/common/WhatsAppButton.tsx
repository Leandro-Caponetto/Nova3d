import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function WhatsAppButton({ theme }: { theme: 'dark' | 'light' }) {
  const phoneNumber = "5491169442108"; 
  const message = encodeURIComponent("Hola Nova3D! Quisiera consultar sobre un servicio de impresión 3D.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-8 right-8 z-[100] flex items-center group cursor-pointer"
      aria-label="Contactar por WhatsApp"
    >
      {/* Outer Pulse Glow Ring */}
      <span className="absolute -inset-1.5 rounded-full bg-[#25D366]/40 blur-md animate-ping opacity-75 group-hover:opacity-100 transition-opacity" />

      {/* Main Glowing Button Badge */}
      <div className={cn(
        "relative flex items-center gap-3 px-4 py-3.5 rounded-full shadow-2xl transition-all duration-300 border",
        "bg-[#25D366] text-white border-emerald-400/30 hover:bg-[#20ba5a]",
        "shadow-[0_10px_30px_rgba(37,211,102,0.45)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.6)]"
      )}>
        {/* Vector SVG WhatsApp Icon */}
        <svg 
          className="w-7 h-7 fill-current shrink-0 drop-shadow-sm" 
          viewBox="0 0 24 24" 
          aria-hidden="true"
        >
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.487 1.332 5.003L2 22l5.127-1.341c1.462.798 3.107 1.218 4.881 1.219h.004c5.506 0 9.989-4.478 9.99-9.985.001-2.668-1.033-5.176-2.919-7.062C17.199 3.036 14.693 2 12.012 2zm5.835 14.502c-.244.688-1.22 1.258-1.701 1.335-.482.078-1.111.139-3.218-.727-2.697-1.108-4.428-3.847-4.563-4.027-.135-.18-1.097-1.463-1.097-2.791 0-1.328.697-1.982.946-2.251.248-.269.542-.337.723-.337.18 0 .361.002.519.009.168.007.394-.064.617.47.225.538.766 1.87.834 2.008.068.138.113.299.023.479-.09.18-.135.292-.27.45-.135.158-.284.354-.405.476-.135.135-.276.282-.119.552.158.27.701 1.155 1.503 1.869 1.031.919 1.899 1.205 2.169 1.34.27.135.428.113.586-.068.158-.18.676-.788.856-1.058.18-.27.361-.225.608-.135.248.09 1.577.743 1.848.878.27.135.451.203.519.316.068.113.068.653-.176 1.341z"/>
        </svg>

        {/* Text Pill */}
        <span className="text-xs font-black tracking-wider uppercase pr-1 whitespace-nowrap">
          WhatsApp
        </span>

        {/* Status Indicator Dot */}
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 border-2 border-[#25D366] animate-pulse" />
      </div>

      {/* Hover Floating Tooltip */}
      <div className={cn(
        "absolute right-full mr-3 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border shadow-2xl backdrop-blur-md",
        theme === 'dark' 
          ? "bg-zinc-950/90 border-white/10 text-white shadow-black/80" 
          : "bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-400/20"
      )}>
        <span className="text-emerald-500 font-extrabold mr-1.5">● ONLINE</span>
        Consultar Impresión 3D
        {/* Arrow pointer */}
        <div className={cn(
          "absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-8 border-transparent border-l-current",
          theme === 'dark' ? "text-zinc-950/90" : "text-white/95"
        )} />
      </div>
    </motion.a>
  );
}

