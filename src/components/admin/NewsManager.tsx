import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Image as ImageIcon, Save, Loader2, Megaphone, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

export function NewsManager({ theme, t }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setNewItem(prev => ({ ...prev, image_url: '' })); // Clear URL if file is selected
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile && !newItem.image_url) {
      alert('Por favor, selecciona una imagen o ingresa una URL.');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = newItem.image_url;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `news-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products') // Using the existing 'products' bucket
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        
        finalImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('news_items')
        .insert([{ ...newItem, image_url: finalImageUrl }]);
      
      if (error) throw error;
      
      setNewItem({ title: '', description: '', image_url: '', button_text: 'CONSULTAR POR WHATSAPP' });
      clearFile();
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
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
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Descripción Corta</label>
              <textarea 
                required value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}
                placeholder="Detalles sobre el lanzamiento..."
                className={cn("w-full border rounded-2xl p-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-primary transition-all min-h-[120px]",
                  theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200")}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Imagen de Novedad</label>
            
            {!previewUrl && !newItem.image_url ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn("border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer hover:border-primary transition-all group min-h-[200px] flex flex-col items-center justify-center",
                  theme === 'dark' ? "border-zinc-800 bg-black/20" : "border-zinc-200 bg-zinc-50")}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <Upload className="w-8 h-8 mb-3 text-zinc-500 group-hover:text-primary transition-colors" />
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">SUBIR DESDE MI ORDENADOR</p>
                <div className="flex items-center gap-4 w-full my-4">
                  <div className="h-px bg-zinc-500/20 flex-grow" />
                  <span className="text-[8px] font-black text-zinc-500">O</span>
                  <div className="h-px bg-zinc-500/20 flex-grow" />
                </div>
                <input 
                  type="url" 
                  value={newItem.image_url} 
                  onChange={e => setNewItem({...newItem, image_url: e.target.value})}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="URL DE IMAGEN EXTERNA..."
                  className={cn("w-full border rounded-xl p-3 text-[9px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                    theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-white border-zinc-200")}
                />
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden border border-primary/20 aspect-video">
                <img 
                  src={previewUrl || newItem.image_url} 
                  className="w-full h-full object-cover" 
                  alt="Preview"
                />
                <button 
                  type="button"
                  onClick={clearFile}
                  className="absolute top-4 right-4 p-2 bg-pink-500 rounded-xl text-white shadow-lg hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-4 bg-primary text-white text-[8px] px-3 py-1 rounded-lg font-black uppercase tracking-widest shadow-lg">
                  PREVISUALIZACION_ACTIVA
                </div>
              </div>
            )}
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
