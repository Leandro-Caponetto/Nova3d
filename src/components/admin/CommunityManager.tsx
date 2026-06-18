import React, { useState, useEffect, useRef } from 'react';
import { Upload, Zap, Image as ImageIcon, X, AlertCircle, Trash2, FileCode, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AlertModal } from '../common/AlertModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { CommunityModel, mapDbToModel, mapModelToDb } from '../views/CommunityView';
import { supabase } from '../../lib/supabase';

const DEFAULT_MODELS: CommunityModel[] = [
  {
    id: 'bambu-poop-chute',
    title: 'Buzón de Purga Magnético / Bambu Poop Chute',
    description: 'Un recolector magnético elegante diseñado para impresoras Bambu Lab y similares. Se acopla perfectamente a la parte trasera, capturando todos los descartes de filamento de forma limpia y ordenada.',
    category: 'Accesorios 3D',
    creator: 'Leo_3D_Design',
    imageUrl: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?q=80&w=600&auto=format&fit=crop',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0Zml4NzcwbGg0Mmp1MTRhZ2oxcW85MHhqZThwYnYyN3V4YXdmaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26AHG5K4UPss6k9u8/giphy.gif',
    fileName: 'magnetic_poop_chute_v2.3mf',
    fileSize: '4.2 MB',
    fileType: '3mf',
    fileDataContent: 'solid magnetic_poop_chute\nfacet normal 0 0 0\nouter loop\nvertex 0 0 0\nendloop\nendsolid',
    downloads: 1240,
    likes: 382,
    createdAt: '11 Jun 2026',
    infill: '15% Gyroid',
    supports: false,
    layerHeight: '0.20 mm',
    filamentType: 'PLA / PETG'
  },
  {
    id: 'articulated-cyber-dragon',
    title: 'Dragón Articulado de Jade (Fidget Toy)',
    description: 'Impresionante modelo articulado imprimible en una sola pieza (Print-in-Place). No requiere soportes. Altamente flexible y satisfactorio al tacto, ideal para filamentos de tipo Silk o cambio de color.',
    category: 'Juguetes & Fidgets',
    creator: 'NovaPolyMath',
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=600&auto=format&fit=crop',
    gifUrl: 'https://media.giphy.com/media/l41JRx6N8UjCskm5D2/giphy.gif',
    fileName: 'articulated_jade_dragon.stl',
    fileSize: '15.8 MB',
    fileType: 'stl',
    fileDataContent: 'solid articulated_dragon\nfacet normal 0 0 0\nouter loop\nvertex 1 2 3\nendloop\nendsolid',
    downloads: 3850,
    likes: 914,
    createdAt: '14 Jun 2026',
    infill: '20% Grid',
    supports: false,
    layerHeight: '0.16 mm',
    filamentType: 'PLA Silk'
  },
  {
    id: 'modular-headset-holder',
    title: 'Soporte Auriculares Ajustable para Escritorio',
    description: 'Soporte mecánico minimalista de auriculares con base tipo morsa a rosca ajustable para tableros de 10mm a 45mm. Súper resistente y práctico para organización gaming o de oficina.',
    category: 'Herramientas & Oficina',
    creator: 'CyberShape',
    imageUrl: 'https://images.unsplash.com/photo-1572021335469-3171624c522c?q=80&w=600&auto=format&fit=crop',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDVtcXZ5eXpxNzc4cmVud3phbTA1M2ZzZGlrNXBhNm1iNXkyZnpxbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKUM3elRFX2tTUI/giphy.gif',
    fileName: 'clamp_headset_stand.3mf',
    fileSize: '8.4 MB',
    fileType: '3mf',
    fileDataContent: 'solid clamp_headset\nfacet normal 0 0 1\nouter loop\nvertex 0 1 0\nendloop\nendsolid',
    downloads: 870,
    likes: 195,
    createdAt: '15 Jun 2026',
    infill: '30% Tri-Hexagonal',
    supports: true,
    layerHeight: '0.20 mm',
    filamentType: 'PETG / PLA Tough'
  },
  {
    id: 'self-watering-pot',
    title: 'Maceta Modular con Autorriego Hexagonal',
    description: 'Diseño inteligente de maceta geométrica hexagonal de dos partes: una cámara de depósito de agua y un contenedor superior para tierra con ranuras capilares. Mantiene la humedad perfecta del suelo.',
    category: 'Hogar & Decoración',
    creator: 'GreenPrint3D',
    imageUrl: 'https://images.unsplash.com/photo-1615812975983-5001a1c97a5a?q=80&w=600&auto=format&fit=crop',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTlkM3k3NDBtYmd3dnN4MTlyczFqZDg5ZnZ4aTZobnZkaWxsMHkwayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Vff5WhvE746Hy/giphy.gif',
    fileName: 'hexagon_watering_pot.stl',
    fileSize: '6.1 MB',
    fileType: 'stl',
    fileDataContent: 'solid watering_pot\nfacet normal 1 0 0\nouter loop\nvertex 1 1 1\nendloop\nendsolid',
    downloads: 1420,
    likes: 299,
    createdAt: '16 Jun 2026',
    infill: '15% Honeycomb',
    supports: false,
    layerHeight: '0.24 mm',
    filamentType: 'PETG (Impermeable)'
  }
];

export function CommunityManager({ theme, t }: { theme: 'dark' | 'light'; t: any }) {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [models, setModels] = useState<CommunityModel[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Accesorios 3D');
  const [creator, setCreator] = useState('Admin');
  const [gifUrl, setGifUrl] = useState('');
  const [infill, setInfill] = useState('15% Gyroid');
  const [supports, setSupports] = useState(false);
  const [layerHeight, setLayerHeight] = useState('0.20 mm');
  const [filamentType, setFilamentType] = useState('PLA');

  const saveModelsToLocalStorage = (list: CommunityModel[]) => {
    try {
      const lightweight = list.map(item => ({ ...item, fileDataContent: '' }));
      localStorage.setItem('nova3d_community_models', JSON.stringify(lightweight));
    } catch (e) {
      console.warn('LocalStorage admin cache failed:', e);
    }
  };

  // File states
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: 'stl' | '3mf'; content: string } | null>(null);

  const [dragActiveImage, setDragActiveImage] = useState(false);
  const [dragActiveFile, setDragActiveFile] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [alert, setAlert] = useState<{ open: boolean; title: string; message: string; type: 'error' | 'success' | 'info' }>({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; modelId: string | null }>({
    open: false,
    modelId: null
  });

  const categories = ['Accesorios 3D', 'Juguetes & Fidgets', 'Herramientas & Oficina', 'Hogar & Decoración', 'Ingeniería & Prototipos'];

  // Load models from Supabase with local storage fallback
  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from('community_models')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const mapped = data.map(mapDbToModel);
        setModels(mapped);
        saveModelsToLocalStorage(mapped);
      } else {
        const stored = localStorage.getItem('nova3d_community_models');
        const listToSeed = stored ? JSON.parse(stored) : DEFAULT_MODELS;
        setModels(listToSeed);
        try {
          await supabase.from('community_models').insert(listToSeed.map(mapModelToDb));
        } catch (seedErr) {
          console.warn('Silent seeding failure:', seedErr);
        }
      }
    } catch (err) {
      console.warn('Supabase community_models query failed in admin panel. Falling back to LocalStorage.', err);
      const stored = localStorage.getItem('nova3d_community_models');
      if (stored) {
        try {
          setModels(JSON.parse(stored));
        } catch (e) {
          setModels(DEFAULT_MODELS);
        }
      } else {
        setModels(DEFAULT_MODELS);
        saveModelsToLocalStorage(DEFAULT_MODELS);
      }
    }
  };

  useEffect(() => {
    loadModels();
  }, [activeTab]);

  // Image Processing & Compression to avoid LocalStorage Quota Exceeded
  const processImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAlert({
        open: true,
        title: 'FORMATO_INVALIDO',
        message: 'Por favor, subí una captura o foto de formato válido (JPG, PNG).',
        type: 'error'
      });
      return;
    }
    const isGifFile = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const rawBase64 = e.target.result as string;
        
        // Save the raw, animated GIF base64 string to play on hover
        if (isGifFile) {
          setGifUrl(rawBase64);
        }

        const img = new Image();
        img.src = rawBase64;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 400; 
          const MAX_HEIGHT = 400;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.6); // Compress to 60% quality jpeg
            setAttachedImage(compressedUrl);
          } else {
            setAttachedImage(rawBase64);
          }
          setAttachedImageName(file.name);
        };
        img.onerror = () => {
          setAttachedImage(rawBase64);
          setAttachedImageName(file.name);
        };
      }
    };
    reader.readAsDataURL(file);
  };

  // Model file processing with light, compliant virtual simulation mesh to protect LocalStorage quota limits
  const processModelFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'stl' && ext !== '3mf') {
      setAlert({
        open: true,
        title: 'FORMATO_SOPORTE_INVALIDO',
        message: 'Solo se aceptan archivos diseñados en formato .STL o .3MF.',
        type: 'error'
      });
      return;
    }

    const displaySize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachedFile({
          name: file.name,
          size: displaySize,
          type: ext as 'stl' | '3mf',
          content: event.target.result as string
        });
      }
    };
    reader.onerror = () => {
      setAlert({
        open: true,
        title: 'ERROR_LECTURA',
        message: 'No se pudo leer la estructura del archivo original.',
        type: 'error'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setAlert({
        open: true,
        title: 'CAMPOS_INCOMPLETOS',
        message: 'Por favor complete el nombre del proyecto y su respectiva descripción.',
        type: 'error'
      });
      return;
    }
    if (!attachedImage) {
      setAlert({
        open: true,
        title: 'FALTA_IMAGEN',
        message: 'Debe incluir una render o captura real de la pieza terminada como referencia visual.',
        type: 'error'
      });
      return;
    }
    if (!attachedFile) {
      setAlert({
        open: true,
        title: 'FALTA_ARCHIVO_3D',
        message: 'Debe adjuntar el archivo (.stl o .3mf) para la descarga del usuario final.',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const newModelObj: CommunityModel = {
        id: `comm-admin-${Date.now()}`,
        title,
        description,
        category,
        creator: creator.trim() || 'Admin-Nova3D',
        imageUrl: attachedImage,
        gifUrl: gifUrl.trim(),
        fileName: attachedFile.name,
        fileSize: attachedFile.size,
        fileType: attachedFile.type,
        fileDataContent: attachedFile.content,
        downloads: 0,
        likes: 0,
        createdAt: 'Hoy',
        infill,
        supports,
        layerHeight,
        filamentType
      };

      const updatedModels = [newModelObj, ...models];
      setModels(updatedModels);
      saveModelsToLocalStorage(updatedModels);

      // Insert into Supabase
      supabase.from('community_models').insert(mapModelToDb(newModelObj))
        .then(({ error }) => {
          if (error) {
            console.warn('Supabase insert failed from admin panel, active local storage fallback:', error);
          }
        });

      // Reset
      setTitle('');
      setDescription('');
      setCategory('Accesorios 3D');
      setCreator('Admin');
      setGifUrl('');
      setInfill('15% Gyroid');
      setSupports(false);
      setLayerHeight('0.20 mm');
      setFilamentType('PLA');
      setAttachedImage(null);
      setAttachedImageName('');
      setAttachedFile(null);

      setAlert({
        open: true,
        title: 'DISEÑO_PUBLICADO_CON_EXITO',
        message: 'El archivo 3D ha sido sincronizado e insertado en la biblioteca directa descargable de tu sección "Comunidad 3D" con éxito.',
        type: 'success'
      });

      setActiveTab('list');
    } catch (err: any) {
      setAlert({
        open: true,
        title: 'ERROR_DE_PROCESAMIENTO',
        message: err.message || 'Ocurrió un error inesperado al archivar el elemento.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete({ open: true, modelId: id });
  };

  const executeDelete = () => {
    if (!confirmDelete.modelId) return;
    try {
      const deletedId = confirmDelete.modelId;
      const updated = models.filter(m => m.id !== deletedId);
      setModels(updated);
      saveModelsToLocalStorage(updated);

      // Delete from Supabase in background
      supabase.from('community_models').delete().eq('id', deletedId)
        .then(({ error }) => {
          if (error) {
            console.warn('Supabase delete failed from admin panel:', error);
          }
        });

      setConfirmDelete({ open: false, modelId: null });

      setAlert({
        open: true,
        title: 'MODELO_ELIMINADO',
        message: 'El archivo descargable y su perfil de diseño han sido purgados de la comunidad exitosamente.',
        type: 'success'
      });
    } catch (err: any) {
      setAlert({
        open: true,
        title: 'ERROR',
        message: 'Fallo al purgar parámetro.',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-12">
      {/* Navigation Headers Tabs */}
      <div className="flex gap-4 border-b border-zinc-500/10 pb-8">
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'create' ? "bg-primary text-white" : "text-zinc-500 hover:text-primary"
          )}
        >
          Cargar Modelo 3D (.STL / .3MF)
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'list' ? "bg-primary text-white" : "text-zinc-500 hover:text-primary"
          )}
        >
          Modelos de la Comunidad ({models.length})
        </button>
      </div>

      {activeTab === 'create' ? (
        <form
          onSubmit={handleSubmit}
          className={cn(
            "border rounded-[3rem] p-8 md:p-12 shadow-[0_0_50px_rgba(245,158,11,0.1)] relative overflow-hidden",
            theme === 'dark' ? "bg-zinc-900 border-primary/10" : "bg-white border-zinc-200"
          )}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3">
              <Zap className="text-primary w-5 h-5 animate-pulse" /> TERMINAL INTERACTIVA DE MODELADO VIRTUAL (MAKERWORLD STYLE)
            </h3>
          </div>

          {/* Form parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            {/* Left Inputs */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1">Nombre del Diseño/Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="EJ: SOPORTE_AURICULARES_AJUSTABLE"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={cn(
                    "w-full border rounded-2xl p-5 text-[11px] font-black tracking-widest focus:outline-none focus:border-primary transition-all",
                    theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1">Creador o Alias *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nova3D_Master"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    className={cn(
                      "w-full border rounded-2xl p-5 text-[11px] font-bold focus:outline-none focus:border-primary transition-all font-mono",
                      theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1">Categoría del Catálogo</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={cn(
                      "w-full border rounded-2xl p-5 text-[11px] font-bold focus:outline-none focus:border-primary transition-all appearance-none",
                      theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                    )}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1">Relleno (Infill) Sugerido</label>
                  <input
                    type="text"
                    placeholder="15% Gyroid"
                    value={infill}
                    onChange={(e) => setInfill(e.target.value)}
                    className={cn(
                      "w-full border rounded-2xl p-5 text-[11px] font-medium focus:outline-none focus:border-primary transition-all",
                      theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1">Altura de Capa (Layer Height)</label>
                  <input
                    type="text"
                    placeholder="0.20 mm"
                    value={layerHeight}
                    onChange={(e) => setLayerHeight(e.target.value)}
                    className={cn(
                      "w-full border rounded-2xl p-5 text-[11px] font-medium focus:outline-none focus:border-primary transition-all",
                      theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1">Filamento Recomendado</label>
                  <input
                    type="text"
                    placeholder="PLA / PETG"
                    value={filamentType}
                    onChange={(e) => setFilamentType(e.target.value)}
                    className={cn(
                      "w-full border rounded-2xl p-5 text-[11px] font-medium focus:outline-none focus:border-primary transition-all",
                      theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1">URL del GIF (Opcional - Hover)</label>
                  <input
                    type="url"
                    placeholder="https://media.giphy.com/..."
                    value={gifUrl}
                    onChange={(e) => setGifUrl(e.target.value)}
                    className={cn(
                      "w-full border rounded-2xl p-5 text-[11px] font-medium focus:outline-none focus:border-primary transition-all",
                      theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3.5 pt-4 pl-2">
                <input
                  type="checkbox"
                  id="admin-supports"
                  checked={supports}
                  onChange={(e) => setSupports(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary border-zinc-500/20 cursor-pointer"
                />
                <label htmlFor="admin-supports" className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 cursor-pointer select-none">
                  ¿Requiere soportes?
                </label>
              </div>
            </div>

            {/* Right Inputs - File upload & Suggestion Box */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1">Sugerencias y Explicación del Diseño *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escribí los parámetros clave para el rebanador slicer (ej: velocidad, enfriamiento, número de perímetros, etc)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(
                    "w-full border rounded-2xl p-5 text-[11px] font-medium focus:outline-none focus:border-primary transition-all min-h-[140px] resize-none",
                    theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                  )}
                />
              </div>

              {/* Upload controls rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Visual Image Section */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-black tracking-widest uppercase text-zinc-500">Render / Captura de Referencia *</label>
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragActiveImage(true); }}
                    onDragLeave={() => setDragActiveImage(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActiveImage(false); if (e.dataTransfer.files?.[0]) processImage(e.dataTransfer.files[0]); }}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center h-28 relative group",
                      dragActiveImage ? "border-primary bg-primary/5" : (theme === 'dark' ? "border-zinc-800 bg-black/20" : "border-zinc-200 bg-zinc-50")
                    )}
                  >
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={(e) => { if (e.target.files?.[0]) processImage(e.target.files[0]); }}
                      accept="image/*"
                      className="hidden"
                    />
                    {attachedImage ? (
                      <div className="flex items-center gap-3">
                        <img src={attachedImage} className="w-12 h-12 rounded-lg object-cover border border-zinc-500/15" />
                        <div className="text-left max-w-[120px] overflow-hidden">
                          <p className="text-[9px] text-emerald-500 font-black truncate">✓ COMPLETO</p>
                          <p className="text-[7.5px] text-zinc-500 truncate">{attachedImageName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setAttachedImage(null); setAttachedImageName(''); }}
                          className="absolute top-1 right-1 p-0.5 bg-rose-500 text-white rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-zinc-500 mb-2 group-hover:text-primary group-hover:scale-110 transition-all" />
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Foto del Producto</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 3D Geometry File Section */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-black tracking-widest uppercase text-zinc-500">Diseño Virtual (.STL o .3MF) *</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragActiveFile(true); }}
                    onDragLeave={() => setDragActiveFile(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActiveFile(false); if (e.dataTransfer.files?.[0]) processModelFile(e.dataTransfer.files[0]); }}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center h-28 relative group",
                      dragActiveFile ? "border-primary bg-primary/5" : (theme === 'dark' ? "border-zinc-800 bg-black/20" : "border-zinc-200 bg-zinc-50")
                    )}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => { if (e.target.files?.[0]) processModelFile(e.target.files[0]); }}
                      accept=".stl,.3mf"
                      className="hidden"
                    />
                    {attachedFile ? (
                      <div className="flex items-center gap-3">
                        <FileCode className="w-8 h-8 text-primary flex-shrink-0" />
                        <div className="text-left max-w-[120px] overflow-hidden">
                          <p className="text-[8px] text-emerald-500 font-mono font-black">.{attachedFile.type.toUpperCase()} LISTO</p>
                          <p className="text-[7.5px] text-zinc-500 truncate font-mono">{attachedFile.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }}
                          className="absolute top-1 right-1 p-0.5 bg-rose-500 text-white rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-zinc-500 mb-2 group-hover:text-primary group-hover:scale-110 transition-all" />
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Subir .STL o .3MF</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-primary text-white font-black uppercase text-xs rounded-2xl shadow-[0_15px_30px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 tracking-widest w-full sm:w-auto"
            >
              {loading ? 'SUBIENDO_DISEÑO_3D...' : 'SUBIR MODELO A LA COMUNIDAD'}
            </button>
          </div>
        </form>
      ) : (
        /* List Tab View */
        <div className="grid grid-cols-1 gap-6">
          <div className={cn("p-6 flex items-center justify-between border-b", theme === 'dark' ? "border-white/5" : "border-zinc-150")}>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">LISTADO DE DISEÑOS CARGADOS EN COMUNIDAD</h4>
            <div className="text-[10px] font-black text-primary uppercase tracking-widest">Modelos Disponibles: {models.length}</div>
          </div>

          {models.map((m) => (
            <div
              key={m.id}
              className={cn(
                "p-8 rounded-[2.5rem] border flex flex-col md:flex-row items-center justify-between overflow-hidden relative gap-6 group transition-all duration-350",
                theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200"
              )}
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="relative flex-shrink-0">
                  <img src={m.imageUrl} className="w-20 h-20 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all border border-zinc-500/10 shadow-lg" />
                  <span className={cn(
                    "absolute -bottom-1 -right-1 text-[8px] font-black px-2 py-0.5 rounded-md border",
                    m.fileType === '3mf' ? "bg-pink-500 text-white border-pink-600" : "bg-sky-500 text-white border-sky-600"
                  )}>
                    .{m.fileType}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-black uppercase italic tracking-tighter leading-snug">{m.title}</h4>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-zinc-500/10 dark:text-zinc-400 text-zinc-600 px-2 py-0.5 rounded-full">
                      by @{m.creator}
                    </span>
                  </div>
                  
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                    Categoría: {m.category} • Tamaño: {m.fileSize}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-1.5 text-[9px] font-mono text-zinc-500">
                    <div>Altura: <span className="font-bold dark:text-zinc-300 text-zinc-800">{m.layerHeight}</span></div>
                    <div>Infill: <span className="font-bold dark:text-zinc-300 text-zinc-800">{m.infill}</span></div>
                    <div>Filamento: <span className="font-bold dark:text-zinc-300 text-zinc-800">{m.filamentType}</span></div>
                  </div>
                </div>
              </div>

              {/* Statistics & Deletion controls */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex gap-4 text-xs font-mono text-zinc-500">
                  <div>
                    <span className="block font-black dark:text-white text-black leading-none">{m.downloads}</span>
                    <span className="text-[8px] tracking-wider uppercase text-zinc-500">Downloads</span>
                  </div>
                  <div>
                    <span className="block font-black dark:text-white text-black leading-none">{m.likes}</span>
                    <span className="text-[8px] tracking-wider uppercase text-zinc-500">Likes</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteClick(m.id)}
                  className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {models.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-500/10 rounded-[40px] text-zinc-400">
              <p className="font-black uppercase text-[10px] tracking-[0.4em]">No hay modelos 3D cargados en la comunidad.</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation popup */}
      <ConfirmModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, modelId: null })}
        onConfirm={executeDelete}
        title="CONFIRMAR_ELIMINACIÓN"
        message="¿Estás seguro de que deseás retirar permanentemente este diseño STL/3MF de los repositorios públicos descargables?"
        theme={theme}
      />

      {/* Alert status dialog box */}
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
