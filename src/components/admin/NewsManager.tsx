import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Image as ImageIcon, Save, Loader2, Megaphone, Upload, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

/**
 * SQL SCHEMA FOR SUPABASE:
 * 
 * create table public.news_items (
 *   id uuid default gen_random_uuid() primary key,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   title text not null,
 *   description text,
 *   image_url text not null,
 *   button_text text default 'CONSULTAR POR WHATSAPP'
 * );
 * 
 * -- Set up RLS
 * alter table public.news_items enable row level security;
 * create policy "Public access to news" on public.news_items for select using (true);
 * create policy "Admin access to news" on public.news_items for all using (auth.role() = 'authenticated');
 */

export function NewsManager({ theme, t }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
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
    setErrorStatus(null);
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error('Error fetching news items:', err);
      if (err.message?.includes('news_items')) {
        setErrorStatus('TABLE_MISSING');
      }
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
      setNewItem(prev => ({ ...prev, image_url: '' }));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateAndPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !newItem.image_url) {
      alert('Por favor, selecciona una imagen o ingresa una URL.');
      return;
    }
    setShowConfirm(true);
  };

  const processAdd = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      let finalImageUrl = newItem.image_url;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `news-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
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
    } catch (err: any) {
      console.error('Error adding news item:', err);
      alert('Error crítico: ' + (err.message || 'Desconocido'));
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
      {/* Table Missing Alert */}
      {errorStatus === 'TABLE_MISSING' && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-center gap-6 animate-pulse">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tighter text-red-500">ERROR_BASE_DE_DATOS</h4>
            <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest leading-relaxed">
              La tabla 'news_items' no ha sido creada. Contacte al administrador para ejecutar el script SQL de inicialización.
            </p>
          </div>
        </div>
      )}

      {/* New Item Form */}
      <form onSubmit={validateAndPrompt} className={cn("p-8 rounded-[32px] border shadow-xl relative overflow-hidden",
        theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <Megaphone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Cargar_Novedad_v1.1</h3>
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
                  referrerPolicy="no-referrer"
                />
                <button 
                  type="button"
                  onClick={clearFile}
                  className="absolute top-4 right-4 p-2 bg-pink-500 rounded-xl text-white shadow-lg hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-4 bg-primary text-white text-[8px] px-3 py-1 rounded-lg font-black uppercase tracking-widest shadow-lg">
                  IMAGEN_SELECCIONADA
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          CONFIRMAR_NUEVA_PUBLICACION
        </button>
      </form>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn("relative w-full max-w-lg p-8 rounded-[40px] border shadow-2xl overflow-hidden",
                theme === 'dark' ? "bg-zinc-950 border-white/10" : "bg-white border-zinc-200")}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 mb-6">
                  <ShieldCheck className="w-10 h-10 text-emerald-500" />
                </div>
                
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">AUTORIZAR_DIFUSIÓN</h3>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8 px-8 leading-relaxed">
                  ¿Confirma la publicación de esta novedad en el panel de inicio del protocolo global?
                </p>

                <div className="w-full grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className={cn("py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      theme === 'dark' ? "border-white/10 hover:bg-white/5" : "border-zinc-200 hover:bg-zinc-50 text-zinc-500")}
                  >
                    ABORTAR_MISION
                  </button>
                  <button 
                    onClick={processAdd}
                    className="py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                  >
                    CONFIRMAR_Y_PUBLICAR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

