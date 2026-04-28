import React, { useState } from 'react';
import { Upload, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { AlertModal } from '../common/AlertModal';

export function Inventory({ theme, t }: any) {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ open: boolean; title: string; message: string; type: 'error' | 'success' | 'info' }>({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'MECH',
    images: ['https://picsum.photos/seed/nova/800/600']
  });

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('products').insert({
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      description: newProduct.description,
      category: newProduct.category,
      images: newProduct.images
    });
    if (error) {
      setAlert({
        open: true,
        title: 'DATA_INSERT_FAILURE',
        message: error.message,
        type: 'error'
      });
    } else {
      setAlert({
        open: true,
        title: 'PROJECT_INITIALIZED',
        message: 'The new design has been successfully logged into the main repository.',
        type: 'success'
      });
      setNewProduct({ name: '', price: '', description: '', category: 'MECH', images: ['https://picsum.photos/seed/nova/800/600'] });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-12">
      <form 
        onSubmit={handleAddProduct}
        className={cn("border rounded-[48px] p-12 shadow-[0_0_50px_rgba(245,158,11,0.1)] relative overflow-hidden",
          theme === 'dark' ? "bg-zinc-900 border-primary/10" : "bg-white border-zinc-200")}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="flex justify-between items-center mb-16">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-4">
            <Zap className="text-primary w-6 h-6 animate-pulse" /> {t.uploadProject}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">{t.projectName}</label>
            <input 
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              placeholder="MECH_CORE_ALPHA" 
              className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")} 
              required
            />
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">{t.baseCost}</label>
            <input 
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              placeholder="000.00" 
              className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")} 
              required
            />
          </div>
        </div>
        
        <div className="mb-12">
          <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4 ml-2">{t.projectDesc}</label>
          <textarea 
            value={newProduct.description}
            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            placeholder="OPERATIONAL_SPECIFICATIONS..." 
            className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all h-48",
              theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")} 
            required
          />
        </div>

        <div className={cn("border-2 border-dashed rounded-[32px] p-24 text-center group transition-all cursor-pointer",
          theme === 'dark' ? "border-zinc-800 bg-black/40 hover:border-primary/50" : "border-zinc-200 bg-zinc-50 hover:border-primary/50")}>
          <Upload className="w-12 h-12 mx-auto mb-6 text-zinc-500 group-hover:text-primary transition-all duration-500 group-hover:-translate-y-2" />
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em]">{t.dropAssets}</p>
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          className="mt-16 px-16 py-6 bg-primary text-white font-black uppercase text-xs rounded-2xl shadow-[0_20px_40px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 tracking-widest"
        >
          {loading ? 'COMPILING_DATA...' : t.initProject}
        </button>
      </form>

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
