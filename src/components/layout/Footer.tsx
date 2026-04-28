import React from 'react';
import { cn } from '../../lib/utils';
import { Box } from 'lucide-react';

export function Footer({ t, theme }: any) {
  return (
    <footer className={cn("border-t py-20 px-4 mt-20 relative overflow-hidden",
      theme === 'dark' ? "bg-bg-base border-white/5" : "bg-zinc-50 border-zinc-200")}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Box className="w-6 h-6 text-primary" />
            <span className="text-xl font-black uppercase italic tracking-tighter">NOVA<span className="text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-colors group-hover:text-primary-light">3D</span></span>
          </div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-black leading-relaxed opacity-60">
            {t.footerDesc}
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8">{t.management || 'LINKS'}</h4>
          <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <li className="hover:text-primary transition-colors cursor-pointer">{t.explore}</li>
            <li className="hover:text-primary transition-colors cursor-pointer">{t.customQuote}</li>
            <li className="hover:text-primary transition-colors cursor-pointer">{t.shipping}</li>
          </ul>
        </div>
        <div className="text-center md:text-right">
          <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest leading-relaxed">
            &copy; 2026 NOVA3D_INDUSTRIAL_NET <br />
            {t.privacy} | {t.terms}
          </p>
        </div>
      </div>
    </footer>
  );
}
