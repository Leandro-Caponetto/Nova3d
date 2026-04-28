import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, Package, Users, Zap } from 'lucide-react';

export function Dashboard({ theme, t }: any) {
  const stats = [
    { id: 'vendor', label: 'Cargar Productos', value: 'Sección Vendedor', icon: Zap, color: 'text-primary', active: true },
    { id: 'orders', label: 'Ingresos de Red', value: '$128.400', icon: TrendingUp, color: 'text-primary' },
    { id: 'orders', label: 'Proyectos Activos', value: '42', icon: Zap, color: 'text-primary' },
    { id: 'orders', label: 'Envíos Totales', value: '1.248', icon: Package, color: 'text-primary' },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, idx) => (
          <div key={idx} className={cn("p-8 rounded-3xl border shadow-[0_10px_30px_rgba(245,158,11,0.05)] relative overflow-hidden group hover:border-primary/20 transition-all",
            theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}>
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform text-primary">
              <s.icon className="w-32 h-32" />
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 ${s.color} shadow-[0_0_15px_rgba(245,158,11,0.2)]`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">{s.label}</p>
            <p className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className={cn("p-12 rounded-[48px] border shadow-2xl relative overflow-hidden",
        theme === 'dark' ? "bg-zinc-900 border-primary/10" : "bg-white border-zinc-200")}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary mb-8 glow-text">NODE_TRAFFIC_VISUALIZATION</h3>
        <div className="h-64 flex items-end gap-3 px-4">
          {[40, 70, 45, 90, 65, 80, 50, 85, 30, 95, 60, 40, 75, 55, 88].map((h, i) => (
            <div key={i} className="flex-grow flex flex-col items-center gap-4 group">
              <div 
                className="w-full bg-primary/30 rounded-t-xl group-hover:bg-primary transition-all relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                style={{ height: `${h}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              </div>
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter group-hover:text-primary transition-colors">T_{i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
