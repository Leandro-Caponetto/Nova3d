import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Shield, Zap, Gift, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SubscriptionDetailsViewProps {
  plan: any;
  theme: 'dark' | 'light';
  t: any;
  onProceed: () => void;
  onBack: () => void;
}

export function SubscriptionDetailsView({ plan, theme, t, onProceed, onBack }: SubscriptionDetailsViewProps) {
  if (!plan) return null;

  return (
    <div className="min-h-screen pt-32 pb-20 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <button 
          onClick={onBack}
          className="mb-12 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Volver al Inicio
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left: Photos & Visuals */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/5 bg-zinc-900 shadow-2xl group">
              <img 
                src="https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?q=80&w=2070&auto=format&fit=crop" 
                alt="3D Printing Detail"
                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-10 left-10 right-10">
                <span className="bg-primary text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-4 inline-block">
                  Calidad Premium
                </span>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                  Resultados Profesionales <br /> en Cada Impresión
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1615812975983-5001a1c97a5a?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1572021335469-3171624c522c?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2076&auto=format&fit=crop"
              ].map((src, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 shadow-lg">
                  <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:scale-110" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Details & Action */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
          >
            <div className="mb-10">
              <span className={cn("text-xs font-black tracking-[0.5em] mb-4 block uppercase", plan.color)}>
                Plan {plan.name}
              </span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white mb-6 leading-[0.9]">
                TU PUERTA A LA <br /> <span className="text-primary italic">REVOLUCIÓN 3D</span>
              </h2>
              <div className="space-y-4 text-zinc-500 text-lg leading-relaxed max-w-xl">
                <p>
                  Unite al club exclusivo de Nova3D. Con el plan {plan.name}, no solo participás por sorteos, sino que desbloqueás un ecosistema de beneficios diseñados para creadores.
                </p>
                <p className="text-white/80 font-medium">
                  Recibís acceso a nuestra galería privada de modelos STL, soporte técnico prioritario y un lugar asegurado en el sorteo mensual automatizado.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {[
                { icon: Zap, label: `${plan.numbers} Números de Sorteo Mensual`, desc: 'Multiplicá tus chances en cada sorteo de productos a elección.' },
                { icon: Shield, label: 'Seguridad Mercado Pago', desc: 'Suscripción segura con el respaldo de la plataforma líder.' },
                { icon: Gift, label: 'Regalos Mensuales', desc: 'Descuentos exclusivos y piezas STL de regalo todos los meses.' },
                { icon: Smartphone, label: 'Contacto Directo', desc: 'Recibí tus números y novedades vía WhatsApp personalizado.' },
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors">
                  <feature.icon className="w-6 h-6 text-primary mb-4" />
                  <h4 className="text-white font-black text-sm uppercase tracking-tight mb-2">{feature.label}</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto p-10 rounded-[3rem] bg-zinc-900 border border-primary/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-baseline gap-2 mb-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  Inversión Mensual
                </div>
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-6xl font-black tracking-tighter text-white">${plan.price}</span>
                  <span className="text-zinc-500 font-bold">ARS / MES</span>
                </div>

                <div className="space-y-4">
                  {plan.benefits.map((benefit: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-zinc-400 text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={onProceed}
                  className="w-full mt-12 py-6 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-[0_20px_50px_rgba(245,158,11,0.3)] hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 group"
                >
                  COMENZAR SUSCRIPCIÓN <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
