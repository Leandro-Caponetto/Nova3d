import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, ArrowRight, ShieldCheck, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface CheckoutViewProps {
  plan: any;
  user: any;
  theme: 'dark' | 'light';
  t: any;
  onBack: () => void;
}

export function CheckoutView({ plan, user, theme, t, onBack }: CheckoutViewProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    dni: '',
    phone: ''
  });

  if (!plan) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Save to Supabase
      const { error } = await supabase.from('subscriptions').insert({
        user_id: user?.id,
        plan_name: plan.name,
        amount: parseFloat(plan.price.replace('.', '').replace(',', '')),
        payment_method: paymentMethod,
        phone: formData.phone,
        dni: formData.dni,
        status: 'pending'
      });

      if (error) throw error;

      // 2. Call local email API
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          email: user.email,
          phone: formData.phone,
          dni: formData.dni,
          plan: plan
        })
      });

      // 3. Simulate redirect or success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If Mercado Pago (Card)
      if (paymentMethod === 'card') {
        const mpLinks: Record<string, string> = {
          'BRONCE': 'https://mpago.la/2nZunV9',
          'PLATA': 'https://mpago.la/1q7Xk6L',
          'ORO': 'https://mpago.la/2vY8mHP',
          'PLATINO': 'https://mpago.la/1k9Bf5R',
        };
        window.open(mpLinks[plan.name] || 'https://www.mercadopago.com.ar', '_blank');
      } else {
        window.open('https://www.paypal.com', '_blank');
      }

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Error al procesar el pago. Intente nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4 bg-white text-black">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">¡ORDEN RECIBIDA!</h2>
          <p className="text-zinc-500 mb-10 text-lg">
            Serás redirigido a la pasarela de pago seleccionada para completar la transacción mensual de <strong>${plan.price}</strong>.
          </p>
          <button 
            onClick={onBack}
            className="w-full py-5 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl"
          >
            VOLVER AL INICIO
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Side: Payment Form */}
          <div className="flex-1">
            <h1 className="text-4xl font-black italic uppercase tracking-tight mb-12">Datos del pago</h1>
            
            <div className="space-y-12">
              {/* Amount Section */}
              <section>
                <h3 className="text-xl font-bold mb-2">Importe del pago</h3>
                <p className="text-zinc-400 text-sm mb-6">Paga el precio establecido o uno superior si quieres.</p>
                <div className="p-8 rounded-3xl border border-zinc-100 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex items-center justify-between group hover:border-zinc-300 transition-all">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">Pago mensual</span>
                    <span className="text-sm text-zinc-400 font-medium">{plan.price} $ al mes</span>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-50 px-6 py-4 rounded-2xl border border-zinc-200">
                    <span className="text-zinc-400 font-bold">$</span>
                    <span className="font-black text-xl text-black">{plan.price}</span>
                  </div>
                </div>
              </section>

              {/* Method Section */}
              <section>
                <h3 className="text-xl font-bold mb-6">Método de pago</h3>
                <div className="flex gap-6">
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "flex-1 py-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest",
                      paymentMethod === 'card' ? "border-black bg-white shadow-xl scale-105" : "border-zinc-100 bg-zinc-50 text-zinc-400"
                    )}
                  >
                    <CreditCard className="w-5 h-5" /> Tarjeta
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('paypal')}
                    className={cn(
                      "flex-1 py-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold",
                      paymentMethod === 'paypal' ? "border-[#0070BA] bg-white shadow-xl scale-105" : "border-zinc-100 bg-zinc-50 text-zinc-400"
                    )}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
                  </button>
                </div>
              </section>

              {/* Card Form */}
              <form onSubmit={handlePayment} className="space-y-8">
                <div className="space-y-6">
                  {/* Identity Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Teléfono / WhatsApp</label>
                      <input 
                        required
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-8 py-5 rounded-2xl border-2 border-zinc-100 focus:border-black outline-none transition-all placeholder:text-zinc-300 font-medium bg-zinc-50/30 focus:bg-white"
                        placeholder="+54 9 11 ..."
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">DNI (Para el sorteo)</label>
                      <input 
                        required
                        type="text" 
                        value={formData.dni}
                        onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                        className="w-full px-8 py-5 rounded-2xl border-2 border-zinc-100 focus:border-black outline-none transition-all placeholder:text-zinc-300 font-medium bg-zinc-50/30 focus:bg-white"
                        placeholder="Sin puntos"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Titular de la tarjeta</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-8 py-5 rounded-2xl border-2 border-zinc-100 focus:border-black outline-none transition-all placeholder:text-zinc-300 font-medium bg-zinc-50/30 focus:bg-white"
                      placeholder="Nombre como figura en la tarjeta"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Detalles de la tarjeta</label>
                    <div className="rounded-2xl border-2 border-zinc-100 overflow-hidden divide-y-2 divide-zinc-100 focus-within:border-black transition-all bg-zinc-50/30 focus-within:bg-white">
                      <div className="flex items-center px-8 py-5">
                        <input required type="text" className="flex-grow outline-none bg-transparent font-medium" placeholder="Número de la tarjeta" />
                        <CreditCard className="w-5 h-5 text-zinc-300" />
                      </div>
                      <div className="flex divide-x-2 divide-zinc-100">
                        <input required type="text" className="w-1/2 px-8 py-5 outline-none bg-transparent font-medium" placeholder="MM / AA" />
                        <input required type="text" className="w-1/2 px-8 py-5 outline-none bg-transparent font-medium" placeholder="CVV" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Código postal de facturación</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-8 py-5 rounded-2xl border-2 border-zinc-100 focus:border-black outline-none transition-all placeholder:text-zinc-300 font-medium bg-zinc-50/30 focus:bg-white"
                      placeholder="Ej: 1425"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">País</label>
                    <div className="relative group">
                      <select className="w-full px-8 py-5 rounded-2xl border-2 border-zinc-100 focus:border-black outline-none appearance-none transition-all bg-zinc-50/30 focus:bg-white font-medium">
                        <option>Argentina</option>
                        <option>Uruguay</option>
                        <option>Chile</option>
                        <option>España</option>
                      </select>
                      <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none group-focus-within:text-black transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-xs text-zinc-400 mb-8 font-medium">
                    Pagarás <span className="font-black text-black">{plan.price} $</span> mensualmente el <span className="font-black text-black">27</span>.
                  </p>
                  <button 
                    disabled={isProcessing}
                    type="submit"
                    className="w-full py-6 rounded-[2rem] bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 group disabled:opacity-50 shadow-2xl shadow-black/20"
                  >
                    {isProcessing ? 'PROCESANDO...' : 'CONFIRMAR Y PAGAR'} 
                    {!isProcessing && <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-32 p-10 rounded-[2.5rem] bg-zinc-50 border border-zinc-100">
              <h3 className="text-xl font-bold mb-10">Resumen del pedido</h3>
              
              <div className="space-y-8 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black flex items-center justify-center p-2">
                    <img 
                      src="https://naisys.io/ais-dev-oml3gsfap6ruhloacogeie-208618344391.us-east1.run.app/favicon.ico" 
                      alt="Erexit3D" 
                      className="w-10 h-10 object-contain invert"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.insertAdjacentHTML('beforeend', '<div class="text-white font-black text-xs">E3D</div>');
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-bold block">Suscripción Club VIP</span>
                    <span className="font-black italic uppercase tracking-tight text-sm">Plan {plan.name}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-zinc-200">
                  <div className="flex justify-between items-center group cursor-pointer">
                    <span className="text-zinc-500 font-bold">Código de descuento</span>
                    <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-black" />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-medium">Pago mensual</span>
                    <span className="font-bold">{plan.price} $</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-zinc-200 flex justify-between items-center">
                  <span className="text-lg font-black italic uppercase tracking-tight">Total a pagar hoy</span>
                  <span className="text-lg font-black tracking-tighter">{plan.price} $</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-100/50 text-[10px] text-zinc-500 leading-tight">
                <ShieldCheck className="w-6 h-6 text-zinc-400 shrink-0" />
                <span>Sus datos están seguros. Nova3D cifra sus datos personales y de tarjeta de crédito para garantizar la máxima seguridad.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
