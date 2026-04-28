import React from 'react';
import { cn } from '../../lib/utils';

export function Nova3DLogo({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div className="relative w-10 h-10 group cursor-pointer flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
      <svg viewBox="0 0 100 100" className={cn("w-8 h-8 transition-transform duration-500 group-hover:scale-110", theme === 'dark' ? "text-primary" : "text-primary-dark")}>
        {/* Modern Geometric Cube/N */}
        <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
        <path d="M50 10 L50 90" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <path d="M15 30 L85 30" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <path d="M15 70 L85 70" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <path d="M50 10 L15 30 M50 10 L85 30 M50 90 L15 70 M50 90 L85 70" stroke="currentColor" strokeWidth="4" />
        <rect x="42" y="42" width="16" height="16" fill="currentColor" className="animate-pulse" />
      </svg>
    </div>
  );
}
