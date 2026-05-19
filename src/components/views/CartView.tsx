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

  const handleWhatsAppCheckout = () => {
    const total = cartWithTieredPrices.reduce((acc: number, item: any) => acc + (item.priceAtQuantity * item.quantity), 0);
    
    let message = `*NUEVO PEDIDO - NOVA3D*\n\n`;
    message += `Hola! Me gustaría realizar el siguiente pedido:\n\n`;
    
    cartWithTieredPrices.forEach((item: any) => {
      message += `• *${item.name}*\n`;
      message += `  Cantidad: ${item.quantity}\n`;
      message += `  Precio Unit: $${item.priceAtQuantity.toLocaleString()}\n`;
      message += `  Subtotal: $${(item.priceAtQuantity * item.quantity).toLocaleString()}\n\n`;
    });
    
    message += `*TOTAL DEL PEDIDO: $${total.toLocaleString()}*\n\n`;
    message += `_Por favor, confírmenme los pasos para el pago y envío._`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5491123456789?text=${encodedMessage}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        {/* Background GIF */}
        <div 
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
          style={{
            backgroundImage: `url('https://miro.medium.com/0*7GEvl-btKKnILMuo.gif')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: theme === 'dark' ? 0.08 : 0.05
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center">
          <ShoppingCart className="w-20 h-20 mx-auto mb-10 text-zinc-500 opacity-20" />
          <h2 className="text-4xl font-light tracking-tighter uppercase mb-6 italic">{t.cart}</h2>
          <p className="text-zinc-500 text-sm tracking-[0.2em] uppercase font-bold">{t.emptyCart}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background GIF */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundImage: `url('https://miro.medium.com/0*7GEvl-btKKnILMuo.gif')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: theme === 'dark' ? 0.08 : 0.05
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 flex flex-col xl:flex-row gap-16">
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
                    NOVA<span className="text-primary glow-text">3D</span>
                  </span>
                </div>
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={item.images[0]} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.insertAdjacentHTML('beforeend', '<div class="w-full h-full flex items-center justify-center text-xs font-black text-zinc-600">3D</div>');
                    }}
                  />
                ) : item.image ? (
                  <img 
                    src={item.image} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.insertAdjacentHTML('beforeend', '<div class="w-full h-full flex items-center justify-center text-xs font-black text-zinc-600">3D</div>');
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-black text-zinc-600">3D</div>
                )}
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
              onClick={handleWhatsAppCheckout}
              disabled={cart.length === 0}
              className={cn(
                "w-full py-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-2xl flex items-center justify-center gap-4 group relative overflow-hidden",
                theme === 'dark' ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-emerald-500 text-white hover:bg-emerald-600"
              )}
            >
              <div className="flex items-center gap-3">
                <svg className="w-7 h-7 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>PEDIR POR WHATSAPP</span>
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
    </div>
  );
}
