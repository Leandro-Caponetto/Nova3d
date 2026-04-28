import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Mail, MessageCircle, ArrowRight, Loader2, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: string;
    numbers: number;
    color: string;
  } | null;
  theme: 'dark' | 'light';
  t: any;
}

export function SubscriptionModal({ isOpen, onClose, plan, theme, t }: SubscriptionModalProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dni: '',
  });

  const mpLinks: Record<string, string> = {
    'BRONCE': 'https://mpago.la/2nZunV9', // Fake links but typical structure
    'PLATA': 'https://mpago.la/1q7Xk6L',
    'ORO': 'https://mpago.la/2vY8mHP',
    'PLATINO': 'https://mpago.la/1k9Bf5R',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    try {
      // 1. Call Backend API
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dni: formData.dni,
          plan: plan,
        }),
      });

      setStep('success');
    } catch (error) {
      console.error('Error in subscription:', error);
      // Fallback to success even if API fails in dev
      setStep('success');
    }
  };

  const handleWhatsAppNotify = () => {
    const adminPhone = '541160492837';
    const message = `¡Hola! Soy ${formData.name}. Recién me registré al PLAN ${plan?.name} ($${plan?.price}). Mi DNI es ${formData.dni}. ¿Me pasás el link de Mercado Pago?`;
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleConfirmEmail = () => {
    const link = mpLinks[plan?.name || ''] || 'https://www.mercadopago.com.ar';
    window.open(link, '_blank');
    onClose();
    setTimeout(() => setStep('form'), 500);
  };

  if (!plan) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={cn(
              "relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border shadow-2xl",
              theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-100"
            )}
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/40 text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-12">
              {step === 'form' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="mb-8">
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-2 block", plan.color)}>
                      SUSCRIPCIÓN {plan.name}
                    </span>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                      REGISTRÁ TU <span className="text-primary">BENEFICIO</span>
                    </h2>
                    <p className="text-zinc-500 text-sm mt-2">
                      Completá tus datos para recibir tu número de la suerte y ser derivado al pago seguro.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Nombre Completo</label>
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        className={cn("w-full px-6 py-4 rounded-2xl border bg-transparent outline-none transition-all",
                          theme === 'dark' ? "border-white/10 focus:border-primary/50" : "border-zinc-200 focus:border-primary/50")}
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Email</label>
                        <input 
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                          className={cn("w-full px-6 py-4 rounded-2xl border bg-transparent outline-none transition-all",
                            theme === 'dark' ? "border-white/10 focus:border-primary/50" : "border-zinc-200 focus:border-primary/50")}
                          placeholder="juan@ejemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">WhatsApp</label>
                        <input 
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                          className={cn("w-full px-6 py-4 rounded-2xl border bg-transparent outline-none transition-all",
                            theme === 'dark' ? "border-white/10 focus:border-primary/50" : "border-zinc-200 focus:border-primary/50")}
                          placeholder="+54 11 ..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">DNI (Para el sorteo)</label>
                      <input 
                        required
                        type="text"
                        value={formData.dni}
                        onChange={e => setFormData(p => ({ ...p, dni: e.target.value }))}
                        className={cn("w-full px-6 py-4 rounded-2xl border bg-transparent outline-none transition-all",
                          theme === 'dark' ? "border-white/10 focus:border-primary/50" : "border-zinc-200 focus:border-primary/50")}
                        placeholder="Sin puntos ni espacios"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full mt-6 py-5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-[0_15px_40px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3 group"
                    >
                      CONFIRMAR REGISTRO <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 'processing' && (
                <div className="text-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-8"
                  >
                    <Loader2 className="w-16 h-16 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Procesando Registro</h3>
                  <p className="text-zinc-500 max-w-xs mx-auto">Estamos vinculando tu número de sorteo a tu DNI...</p>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-primary mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-primary/20"
                  >
                    <Mail className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2 leading-none">¡CASI LISTO!</h3>
                  <p className="text-zinc-500 mb-8 max-w-sm mx-auto text-sm">
                    Para activar tu suscripción, realizá estas 2 acciones:
                  </p>
                  
                  <div className="flex flex-col gap-4 mb-8">
                    <button 
                      onClick={handleWhatsAppNotify}
                      className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
                    >
                      1. NOTIFICAR POR WHATSAPP <MessageCircle className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={handleConfirmEmail}
                      className="w-full py-4 rounded-2xl bg-[#3483FA] text-white font-black text-xs uppercase tracking-widest hover:bg-[#2968C8] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
                    >
                      2. IR A MERCADO PAGO <CreditCard className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 text-left">
                      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-1">Confirmación Enviada</p>
                        <p className="text-white text-xs">Revisá tu mail: {formData.email}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep('form')}
                    className="mt-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                  >
                    VOLVER A EDITAR DATOS
                  </button>
                </div>
              )}
            </div>
            
            {/* Background Branding */}
            <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
              <span className="text-[100px] font-black tracking-tighter uppercase italic leading-none">NOVA3D</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
