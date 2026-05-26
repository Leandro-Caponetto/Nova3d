import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Save, Loader2, Megaphone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

export function NewsManager({ theme, t }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    image_url: '',
    button_text: 'CONSULTAR POR WHATSAPP'
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching news items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('news_items')
        .insert([newItem]);
      
      if (error) throw error;
      setNewItem({ title: '', description: '', image_url: '', button_text: 'CONSULTAR POR WHATSAPP' });
      fetchItems();
    } catch (err) {
      console.error('Error adding news item:', err);
      alert('Error al guardar: ' + (err as any).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta novedad?')) return;
    try {
      const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchItems();
    } catch (err) {
      console.error('Error deleting news item:', err);
    }
  };

  return (
    <div className="space-y-12">
      {/* New Item Form */}
      <form onSubmit={handleAdd} className={cn("p-8 rounded-[32px] border shadow-xl",
        theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <Megaphone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Cargar_Novedad_v1.0</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Protocolo de difusión activa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Título de Novedad</label>
            <input 
              type="text" required value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})}
              placeholder="PULPO REVERSIBLE 3D..."
              className={cn("w-full border rounded-2xl p-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">URL de Imagen</label>
            <input 
              type="url" required value={newItem.image_url} onChange={e => setNewItem({...newItem, image_url: e.target.value})}
              placeholder="https://..."
              className={cn("w-full border rounded-2xl p-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200")}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Descripción Corta</label>
            <textarea 
              required value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}
              placeholder="Detalles sobre el lanzamiento..."
              className={cn("w-full border rounded-2xl p-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-primary transition-all min-h-[100px]",
                theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200")}
            />
          </div>
        </div>

        <button 
          type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          AUTORIZAR_PUBLICACION
        </button>
      </form>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-20 italic font-black uppercase tracking-[0.3em]">
            SIN_PUBLICACIONES_ACTIVAS
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id}
              className={cn("group rounded-[32px] overflow-hidden border transition-all",
                theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200 shadow-lg")}
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                <h4 className="text-sm font-black italic uppercase tracking-tighter mb-2">{item.title}</h4>
                <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-widest line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
