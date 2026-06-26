import React, { useState, useEffect, useRef } from 'react';
import { Upload, Zap, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { AlertModal } from '../common/AlertModal';
import { ConfirmModal } from '../common/ConfirmModal';

const packMetadata = (desc: string, mpLink: string, disc: number, freeShip: boolean) => {
  const metaObj = { mpLink, disc, freeShip };
  return `${desc}\n\n[ML_METADATA:${JSON.stringify(metaObj)}]`;
};

const unpackMetadata = (fullDesc: string) => {
  const match = fullDesc?.match(/\[ML_METADATA:(.*)\]$/);
  if (match) {
    try {
      const meta = JSON.parse(match[1]);
      const desc = fullDesc.replace(/\n\n\[ML_METADATA:.*\]$/, '');
      return { desc, mpLink: meta.mpLink || '', disc: meta.disc || 0, freeShip: !!meta.freeShip };
    } catch (e) {
      // Ignore
    }
  }
  return { desc: fullDesc || '', mpLink: '', disc: 0, freeShip: false };
};

export function VendorPortal({ theme, t, onProductChange }: any) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mpLink, setMpLink] = useState('');
  const [mpDiscount, setMpDiscount] = useState('10');
  const [mpFreeShipping, setMpFreeShipping] = useState(true);

  const [alert, setAlert] = useState<{ open: boolean; title: string; message: string; type: 'error' | 'success' | 'info' }>({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; productId: string | null }>({
    open: false,
    productId: null
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'MECH',
    price_per_gram: '',
    price_per_hour: '',
    stock: '10',
    is_featured: false,
    images: [] as string[]
  });

  // Fetch products for the list view
  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchProducts();
    }
  }, [activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setMpLink('');
    setMpDiscount('10');
    setMpFreeShipping(true);
    setNewProduct({ 
      name: '', 
      price: '', 
      description: '', 
      category: 'MECH', 
      price_per_gram: '', 
      price_per_hour: '', 
      stock: '10',
      is_featured: false,
      images: [] 
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    setActiveTab('list');
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    const unpacked = unpackMetadata(product.description);
    setMpLink(unpacked.mpLink);
    setMpDiscount(unpacked.disc.toString());
    setMpFreeShipping(unpacked.freeShip);

    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      description: unpacked.desc,
      category: product.category,
      price_per_gram: product.price_per_gram?.toString() || '',
      price_per_hour: product.price_per_hour?.toString() || '',
      stock: product.stock.toString(),
      is_featured: product.is_featured,
      images: product.images
    });
    // For editing, we don't clear existing images from DB, 
    // but user can upload *additional* ones from PC.
    setSelectedFiles([]);
    setPreviewUrls([]);
    setActiveTab('create');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedImageUrls: string[] = [...newProduct.images];

      // Upload new files to Supabase Storage if any
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload Error:', uploadError);
          throw new Error(`Error al subir la imagen "${file.name}": ${uploadError.message}. Asegúrate de que el bucket "products" esté creado en Supabase.`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        uploadedImageUrls.push(publicUrl);
      }

      // If no files and no previous images, use placeholder
      if (uploadedImageUrls.length === 0) {
        uploadedImageUrls.push('https://picsum.photos/seed/nova/800/600');
      }

      const packedDescription = packMetadata(newProduct.description, mpLink, parseInt(mpDiscount) || 0, mpFreeShipping);

      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: packedDescription,
        category: newProduct.category,
        images: uploadedImageUrls,
        price_per_gram: newProduct.price_per_gram ? parseFloat(newProduct.price_per_gram) : null,
        price_per_hour: newProduct.price_per_hour ? parseFloat(newProduct.price_per_hour) : null,
        stock: parseInt(newProduct.stock) || 0,
        is_featured: newProduct.is_featured
      };

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);
        if (error) throw error;
        
        setAlert({
          open: true,
          title: 'ACTUALIZACIÓN EXITOSA',
          message: 'El producto fue actualizado correctamente.',
          type: 'success'
        });
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;

        setAlert({
          open: true,
          title: 'CARGA EXITOSA',
          message: 'El producto fue dado de alta correctamente en el sistema.',
          type: 'success'
        });
      }

      // Reset
      setEditingId(null);
      setMpLink('');
      setMpDiscount('10');
      setMpFreeShipping(true);
      setNewProduct({ 
        name: '', 
        price: '', 
        description: '', 
        category: 'MECH', 
        price_per_gram: '', 
        price_per_hour: '', 
        stock: '10',
        is_featured: false,
        images: [] 
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setActiveTab('list');
      fetchProducts();
      if (onProductChange) onProductChange();
    } catch (error: any) {
      setAlert({
        open: true,
        title: 'ERROR_DE_SISTEMA',
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setConfirmDelete({ open: true, productId: id });
  }

  async function performDelete() {
    if (!confirmDelete.productId) return;
    
    try {
      setLoading(true);
      const { error } = await supabase.from('products').delete().eq('id', confirmDelete.productId);
      if (error) throw error;
      
      fetchProducts();
      if (onProductChange) onProductChange();
      
      setAlert({
        open: true,
        title: 'ELIMINACIÓN_COMPLETA',
        message: 'El activo ha sido removido del sistema permanentemente.',
        type: 'success'
      });
    } catch (error: any) {
      setAlert({
        open: true,
        title: 'ERROR_DE_SISTEMA',
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
      setConfirmDelete({ open: false, productId: null });
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex gap-4 border-b border-zinc-500/10 pb-8">
        <button 
          onClick={() => {
            if (!editingId) setActiveTab('create');
            else cancelEdit();
          }}
          className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'create' ? "bg-primary text-white" : "text-zinc-500 hover:text-primary")}
        >
          {editingId ? 'EDITANDO PRODUCTO' : (t.uploadProduct || 'Cargar Producto')}
        </button>
        <button 
          onClick={() => {
            setEditingId(null);
            setActiveTab('list');
          }}
          className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'list' ? "bg-primary text-white" : "text-zinc-500 hover:text-primary")}
        >
          {t.inventory || 'Inventario'}
        </button>
      </div>

      {activeTab === 'create' ? (
        <form 
          onSubmit={handleSubmit}
          className={cn("border rounded-[48px] p-12 shadow-[0_0_50px_rgba(245,158,11,0.1)] relative overflow-hidden",
            theme === 'dark' ? "bg-zinc-900 border-primary/10" : "bg-white border-zinc-200")}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <div className="flex justify-between items-center mb-16">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-4">
              <Zap className="text-primary w-6 h-6 animate-pulse" /> {editingId ? 'EDICIÓN_DE_NODO_ACTIVA' : 'TERMINAL_DE_CARGA_ARG'}
            </h3>
            <div className="flex items-center gap-8">
              {editingId && (
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="text-[9px] font-black uppercase tracking-widest text-pink-500 hover:text-pink-400 transition-colors"
                >
                  [ CANCELAR_EDICIÓN ]
                </button>
              )}
              <label className="flex items-center gap-3 cursor-pointer group">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-primary transition-colors">DESTACAR_PRODUCTO</span>
                <input 
                  type="checkbox" 
                  checked={newProduct.is_featured} 
                  onChange={(e) => setNewProduct(prev => ({...prev, is_featured: e.target.checked}))}
                  className="w-4 h-4 rounded border-primary/20 bg-black/40 text-primary focus:ring-primary/40"
                />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">NOMBRE_DEL_PRODUCTO</label>
                <input 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="EJ: DRAGON_ARTICULADO" 
                  className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                    theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")} 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">PRECIO_UNITARIO</label>
                  <input 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="000.00" 
                    className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                      theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")} 
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">STOCK_DISPONIBLE</label>
                  <input 
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    placeholder="0" 
                    className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                      theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")} 
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">FOTOS_DEL_PRODUCTO (DESDE TU PC)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn("border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer hover:border-primary transition-all group",
                  theme === 'dark' ? "border-zinc-800 bg-black/20" : "border-zinc-200 bg-zinc-50")}
              >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <Upload className="w-8 h-8 mx-auto mb-3 text-zinc-500 group-hover:text-primary transition-colors" />
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Hacé click para buscar fotos {editingId ? 'adicionales' : ''}</p>
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4">
                {editingId && newProduct.images.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-white/20 opacity-60">
                    <img src={url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[7px] font-black text-white uppercase tracking-tighter">EXISTENTE</span>
                    </div>
                  </div>
                ))}
                {previewUrls.map((url, idx) => (
                  <div key={`new-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-primary/20">
                    <img src={url} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-pink-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute top-1 left-1 bg-primary text-white text-[6px] px-1 py-0.5 rounded font-black uppercase">NUEVA</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">CATEGORÍA</label>
              <select 
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all appearance-none",
                  theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")}
              >
                <option value="MECH">MECH</option>
                <option value="INDUSTRIAL">INDUSTRIAL</option>
                <option value="DECOR">DECOR</option>
                <option value="COSPLAY">COSPLAY</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">PRECIO_POR_GRAMO (OPCIONAL)</label>
              <input 
                value={newProduct.price_per_gram}
                onChange={(e) => setNewProduct({...newProduct, price_per_gram: e.target.value})}
                placeholder="0.05"
                className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                  theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")} 
              />
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">PRECIO_POR_HORA (OPCIONAL)</label>
              <input 
                value={newProduct.price_per_hour}
                onChange={(e) => setNewProduct({...newProduct, price_per_hour: e.target.value})}
                placeholder="2.50"
                className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                  theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")} 
              />
            </div>
          </div>
          
          <div className="mb-12">
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4 ml-2">DESCRIPCIÓN_TÉCNICA</label>
            <textarea 
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              placeholder="ESPECIFICACIONES_OPERATIVAS..." 
              className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all h-32",
                theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")} 
              required
            />
          </div>

          {/* MÓDULO MERCADO PAGO INTEGRATION */}
          <div className="mb-12 border-t border-zinc-500/10 pt-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary animate-pulse" /> CONFIGURACIÓN_MERCADO_PAGO_Y_TIENDA_ML
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">PREFERENCIA_ID_O_LINK_DIRECTO_MP</label>
                <input 
                  value={mpLink}
                  onChange={(e) => setMpLink(e.target.value)}
                  placeholder="https://mpago.la/..." 
                  className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                    theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")} 
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">DESCUENTO_EN_TIENDA_ML ( % )</label>
                <input 
                  type="number"
                  value={mpDiscount}
                  onChange={(e) => setMpDiscount(e.target.value)}
                  placeholder="10" 
                  className={cn("w-full border rounded-2xl p-6 text-[12px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                    theme === 'dark' ? "bg-black/40 border-white/10" : "bg-zinc-50 border-zinc-200")} 
                />
              </div>

              <div className="flex items-center gap-4 h-full md:pt-8 pl-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={mpFreeShipping} 
                    onChange={(e) => setMpFreeShipping(e.target.checked)}
                    className="w-5 h-5 rounded border-primary/20 bg-black/40 text-primary focus:ring-primary/40"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-primary transition-colors">OFRECER_ENVÍO_GRATIS</span>
                </label>
              </div>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="mt-8 px-16 py-6 bg-primary text-white font-black uppercase text-xs rounded-2xl shadow-[0_20px_40px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 tracking-widest w-full sm:w-auto"
          >
            {loading ? 'SINCRONIZANDO_DATOS...' : (editingId ? 'ACTUALIZAR_PRODUCTO' : 'FINALIZAR_CARGA')}
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className={cn("p-6 flex items-center justify-between border-b", theme === 'dark' ? "border-white/5" : "border-zinc-100")}>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">LISTADO_DE_ACTIVOS_MÓDULO_VENDOR</h4>
            <div className="text-[10px] font-black text-primary uppercase tracking-widest">Total: {products.length}</div>
          </div>
          {products.map((p) => (
            <div key={p.id} className={cn("p-8 rounded-[32px] border flex flex-col md:flex-row items-center justify-between group overflow-hidden relative gap-8",
              theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}>
              <div className="flex items-center gap-8 relative z-10 w-full md:w-auto">
                <div className="relative flex-shrink-0">
                  <img src={p.images[0]} className="w-24 h-24 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all border border-white/5 shadow-xl" />
                  {p.images.length > 1 && (
                    <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[8px] px-2 py-1 rounded-md font-black shadow-lg border border-white/10">
                      +{p.images.length - 1}_FOTOS
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-black uppercase italic tracking-tighter">{p.name}</h4>
                    {p.isFeatured && <span className="bg-primary/20 text-primary text-[8px] px-2 py-0.5 rounded font-black tracking-widest border border-primary/20 uppercase">DESTACADO</span>}
                  </div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-4">{p.category} // ${p.price}</p>
                  <div className="flex gap-4">
                    <div className="flex flex-col border-l-2 border-primary/30 pl-3">
                      <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">EN_STOCK</span>
                      <span className={cn("text-[10px] font-mono font-black", p.stock > 0 ? "text-green-500" : "text-pink-500")}>{p.stock || 0} UNI</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 relative z-10 w-full md:w-auto justify-end">
                <button 
                  onClick={() => handleEdit(p)}
                  className="px-6 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-black text-[9px] uppercase tracking-widest"
                >
                  EDITAR
                </button>
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="px-6 py-3 rounded-xl text-pink-500 hover:bg-pink-500/10 transition-all font-black text-[9px] uppercase tracking-widest"
                >
                  ELIMINAR
                </button>
              </div>
              {p.isFeatured && <div className="absolute inset-0 bg-primary/5 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />}
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-[40px]">
              <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.5em]">Repositorio_Vacio</p>
            </div>
          )}
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, productId: null })}
        onConfirm={performDelete}
        title="CONFIRMAR_ELIMINACIÓN"
        message="¿Estás seguro de que deseás borrar este producto? Esta acción no se puede deshacer y el activo será removido de todos los catálogos."
        theme={theme}
      />

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
