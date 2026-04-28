import React from 'react';
import { cn } from '../../lib/utils';

export function Orders({ theme, t }: any) {
  return (
    <div className={cn("border rounded-[48px] p-12 shadow-3xl",
      theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}>
      <div className="flex justify-between items-center mb-16">
        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-500">{t.recentSubmissions}</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-zinc-500 uppercase text-[9px] font-black tracking-[0.5em] border-b border-zinc-500/10">
            <tr>
              <th className="pb-8">BATCH_CODE</th>
              <th className="pb-8">SOURCE_ID</th>
              <th className="pb-8 text-right">METRIC_ABS</th>
              <th className="pb-8 text-center">STAT</th>
            </tr>
          </thead>
          <tbody className="divide-y border-zinc-500/10">
            {[1,2,3,4,5].map(i => (
              <tr key={i} className="hover:bg-primary/[0.02] transition-colors group">
                <td className="py-8 font-mono font-black text-zinc-600 dark:text-zinc-400 tracking-tighter">#NV-00{i}-SYS</td>
                <td className="py-8 font-black italic uppercase tracking-tighter text-zinc-800 dark:text-zinc-200">EXT_OPERATOR_{i}</td>
                <td className="py-8 text-right font-mono font-black text-primary text-lg animate-pulse">${(1500 * i).toLocaleString()}._NAV</td>
                <td className="py-8 flex justify-center">
                  <span className={cn(
                    "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border",
                    i % 2 === 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"
                  )}>
                    {i % 2 === 0 ? t.confirmed : t.pending}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
