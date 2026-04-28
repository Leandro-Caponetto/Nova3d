import React, { useState } from 'react';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CartItem } from '../../types';
import { AlertModal } from '../common/AlertModal';

const getPriceTier = (quantity: number, basePrice: number) => {
  if (quantity >= 1000) return basePrice * 0.50; // 50% OFF (Mega Wholesaler)
  if (quantity >= 500) return basePrice * 0.65;  // 35% OFF (Major Wholesaler)
  if (quantity >= 100) return basePrice * 0.75;  // 25% OFF (Wholesale)
  if (quantity >= 50) return basePrice * 0.85;   // 15% OFF (Local Business)
  if (quantity >= 10) return basePrice * 0.90;   // 10% OFF (Small Batch)
  return basePrice;
};

export function CartView({ cart, remove, products, t, theme, user }: any) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [alert, setAlert] = useState<{ open: boolean; title: string; message: string; type: 'error' | 'success' | 'info' }>({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  const cartWithTieredPrices = cart.map((item: CartItem) => ({
    ...item,
    priceAtQuantity: getPriceTier(item.quantity, item.price)
  }));

  const total = cartWithTieredPrices.reduce((acc: number, item: any) => acc + (item.priceAtQuantity * item.quantity), 0);

  const handlePayMP = async () => {
    setIsProcessing(true);
    try {
      const resp = await fetch('/api/pay/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartWithTieredPrices.map((i: any) => ({ ...i, price: i.priceAtQuantity })), total, userId: user?.id })
      });
      const data = await resp.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setAlert({
          open: true,
          title: 'PAYMENT_ERROR',
          message: data.error || "Error processing payment through Mercado Pago. Please try again later.",
          type: 'error'
        });
      }
    } catch (err) {
      setAlert({
        open: true,
        title: 'NETWORK_FAILURE',
        message: "Unable to establish secure connection with payment processor.",
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPayPal = async () => {
    setIsProcessing(true);
    try {
      const resp = await fetch('/api/pay/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartWithTieredPrices.map((i: any) => ({ ...i, price: i.priceAtQuantity })), total, userId: user?.id })
      });
      const data = await resp.json();
      if (data.approval_url) {
        window.location.href = data.approval_url;
      } else {
        setAlert({
          open: true,
          title: 'PAYMENT_ERROR',
          message: "Error processing PayPal payment. Check your account standing.",
          type: 'error'
        });
      }
    } catch (err) {
      setAlert({
        open: true,
        title: 'NETWORK_FAILURE',
        message: "Unable to establish secure connection with payment processor.",
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <ShoppingCart className="w-20 h-20 mx-auto mb-10 text-zinc-500 opacity-20" />
        <h2 className="text-4xl font-light tracking-tighter uppercase mb-6 italic">{t.cart}</h2>
        <p className="text-zinc-500 text-sm tracking-[0.2em] uppercase font-bold">{t.emptyCart}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col xl:flex-row gap-16">
      <div className="flex-grow">
        <h2 className="text-5xl font-light tracking-tighter uppercase mb-20 leading-none">
          {t.cart} <span className="font-black italic text-primary">({cart.length})</span>
        </h2>
        
        <div className="space-y-8">
          {cartWithTieredPrices.map((item: any) => (
            <div key={item.id} className={cn("flex flex-col sm:flex-row items-center gap-10 p-10 rounded-[40px] border transition-all",
              theme === 'dark' ? "bg-zinc-900/50 border-white/5" : "bg-white border-zinc-200")}>
              <div className="w-32 h-32 bg-zinc-800 rounded-3xl overflow-hidden shrink-0 shadow-2xl relative group">
                {/* Watermark */}
                <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md border border-white/5 pointer-events-none">
                  <span className="text-[7px] font-black tracking-tighter uppercase text-white">
                    NOVA<span className="text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] glow-text">3D</span>
                  </span>
                </div>
                <img src={item.images[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h4 className="text-xl font-black uppercase italic tracking-tighter mb-2">{item.name}</h4>
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">{t.quantity}: {item.quantity}</span>
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                  {item.priceAtQuantity < item.price && (
                    <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                      {Math.round((1 - (item.priceAtQuantity / item.price)) * 100)}% OFF_BULK
                    </span>
                  )}
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest italic">STD_SHIP</span>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-3xl font-black italic tracking-tighter text-primary mb-6">${(item.priceAtQuantity * item.quantity).toLocaleString()}</p>
                <button 
                  onClick={() => remove(item.id)} 
                  className="text-pink-500 text-[10px] uppercase font-black tracking-[0.3em] hover:bg-pink-500/10 px-6 py-2 rounded-xl transition-all border border-pink-500/20"
                >
                  {t.remove}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full xl:w-[450px]">
        <div className={cn("border p-12 rounded-[48px] sticky top-32 shadow-3xl overflow-hidden relative",
          theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}>
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-12">{t.summary}</h3>
          
          <div className="space-y-8 mb-12">
            <div className="flex justify-between text-zinc-500 text-[11px] font-bold uppercase tracking-widest">
              <span>{t.subtotal}</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-500 text-[11px] font-bold uppercase tracking-widest">
              <span>{t.shipping}</span>
              <span className="text-primary font-black italic tracking-widest">{t.freeGlobal}</span>
            </div>
            <div className="border-t border-zinc-500/10 pt-10 flex justify-between items-end">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">{t.total}</span>
              <span className="text-5xl font-black italic tracking-tighter text-primary drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">${total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handlePayMP}
              disabled={isProcessing || cart.length === 0}
              className={cn(
                "w-full py-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-2xl flex items-center justify-center gap-4 group relative overflow-hidden",
                theme === 'dark' ? "bg-[#009EE3] text-white hover:bg-[#0086c3]" : "bg-[#009EE3] text-white hover:bg-[#0086c3]"
              )}
            >
              {isProcessing ? (
                <CreditCard className="w-5 h-5 animate-pulse" />
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="w-7 h-7 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <ellipse cx="23.5" cy="23.5" fill="#4fc3f7" rx="21.5" ry="15.5"></ellipse>
                    <path fill="#fafafa" d="M22.471,24.946c-1.978-5.537-4.884-10.881-6.085-12.995c-0.352-0.619-0.787-1.186-1.29-1.69 l-2.553-2.553c-0.391-0.391-1.414,0-1.414,0L9.497,8.734l-0.162,2.319L8.773,11c-0.518,0-0.938,0.42-0.938,0.938 c0,0.52,0.413,0.969,0.933,0.961c1.908-0.03,3.567,1.601,3.567,1.601h2c0.32,0.32,1.139,1.366,1.328,2.439 c0.107,0.611,0.154,1.229,0.119,1.848C15.458,24.622,16.835,26,16.835,26c-5.5-3.5-14.819-2.964-14.819-2.964l0.193,3.016L5,31 c0.919,0.212,0.744-0.626,1.765-0.504c6.199,0.741,13.57,0.004,13.57,0.004c1.5,0,1.958-0.793,2.665-1.5 C24,28,22.849,26.004,22.471,24.946z"></path>
                    <path fill="#fafafa" d="M24.913,24.946c1.978-5.537,4.884-10.881,6.085-12.995c0.352-0.619,0.787-1.186,1.29-1.69 l2.553-2.553c0.391-0.391,1.414,0,1.414,0L37.814,9l0.235,2.053L38.611,11c0.518,0,0.938,0.42,0.938,0.938 c0,0.52-0.413,0.969-0.933,0.961c-1.908-0.03-3.567,1.601-3.567,1.601h-2c-0.32,0.32-1.139,1.366-1.328,2.439 c-0.107,0.611-0.154,1.229-0.119,1.848C31.926,24.622,30.549,26,30.549,26c5.5-3.5,15-3,15-3l-0.165,3l-3,5 c-0.919,0.212-0.744-0.626-1.765-0.504c-6.199,0.741-13.57,0.004-13.57,0.004c-1.5,0-1.958-0.793-2.665-1.5 C23.384,28,24.535,26.004,24.913,24.946z"></path>
                  </svg>
                  <span>MERCADO PAGO</span>
                </div>
              )}
            </button>
            <button 
              onClick={handlePayPayPal}
              disabled={isProcessing || cart.length === 0}
              className={cn("w-full py-6 rounded-2xl font-black flex items-center justify-center gap-4 transition-all border text-[11px] uppercase tracking-widest group shadow-xl",
                theme === 'dark' ? "bg-[#FFC439] border-transparent text-[#2C2E2F] hover:bg-[#e6b033]" : "bg-[#FFC439] border-transparent text-[#2C2E2F] hover:bg-[#e6b033]")}
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#253B80" d="M20.067 8.178c-.008.056-.013.111-.019.167-.22 2.05-1.782 4.417-4.433 4.417h-1.896c-.347 0-.649.243-.726.582l-.995 4.38h-2.906l1.83-8.062a.753.753 0 0 1 .726-.582h3.424c1.688 0 2.825.864 2.825 2.378 0 1.579-1.258 2.378-2.637 2.378h-.69a.442.442 0 0 0-.427.342l-.248 1.094h1.161c2.197 0 4.015-1.558 4.015-3.81 0-2.253-1.66-3.284-4.225-3.284h-3.957a.753.753 0 0 0-.726.582l-1.042 4.59h-2.673l1.83-8.062A.753.753 0 0 1 11.238 3h4.604c3.415 0 5.625 1.55 5.625 4.5 0 .227-.009.453-.027.678h-.001a4.91 4.91 0 0 0-1.372 0z"/>
                  <path fill="#179BD7" d="M11.664 16.622l-.767 3.378H7.991l2.422-10.667h2.906l-1.655 7.289z"/>
                </svg>
                <span>PAYPAL</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <AlertModal 
        isOpen={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        theme={theme}
      />
    </div>
  );
}
