import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function WhatsAppButton({ theme }: { theme: 'dark' | 'light' }) {
  // Use a placeholder number, users can change it later
  const phoneNumber = "5491169442102"; 
  const message = encodeURIComponent("Hola Nova3D! Quisiera consultar sobre un servicio de impresión.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-2xl group",
        "bg-[#25D366] text-white hover:bg-[#20ba5a] shadow-[0_15px_35px_rgba(37,211,102,0.3)]"
      )}
    >
      <div className="absolute inset-0 bg-white/20 rounded-[24px] scale-0 group-hover:scale-100 transition-transform duration-500" />
      
      <img 
        src="https://img.freepik.com/vector-premium/whatsapp-vector-logo-icono-logotipo-vector-redes-sociales_901408-402.jpg?semt=ais_hybrid&w=740&q=80" 
        alt="WhatsApp"
        className="w-2/3 h-2/3 object-contain drop-shadow-md rounded-[12px]"
        referrerPolicy="no-referrer"
      />
      
      {/* Tooltip */}
      <div className={cn(
        "absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border shadow-xl",
        theme === 'dark' ? "bg-zinc-900 border-white/10 text-white" : "bg-white border-zinc-200 text-black"
      )}>
        PROCESAR_CONSULTA_WA
        <div className={cn(
          "absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-r border-t",
          theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
        )} />
      </div>
    </motion.a>
  );
}
