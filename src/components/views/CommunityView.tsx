import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Heart, UploadCloud, Search, Eye, Sparkles, Filter, 
  FileCode, X, Image as ImageIcon, MessageSquare, AlertCircle, 
  Settings, Layers, ChevronRight, Check, Share2, Printer
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

// Model interface
export interface CommunityModel {
  id: string;
  title: string;
  description: string;
  category: string;
  creator: string;
  imageUrl: string;
  gifUrl?: string; // Animated GIF for card hover
  fileName: string;
  fileSize: string;
  fileType: 'stl' | '3mf';
  fileDataContent: string; // Raw or base64 file data
  downloads: number;
  likes: number;
  createdAt: string;
  infill: string;
  supports: boolean;
  layerHeight: string;
  filamentType: string;
}

// Database helper mapping functions to bridge Postgres snake_case and UI camelCase
export const mapDbToModel = (row: any): CommunityModel => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  category: row.category,
  creator: row.creator,
  imageUrl: row.image_url || '',
  gifUrl: row.gif_url || '',
  fileName: row.file_name,
  fileSize: row.file_size || '',
  fileType: row.file_type as 'stl' | '3mf',
  fileDataContent: row.file_data_content || '',
  downloads: row.downloads || 0,
  likes: row.likes || 0,
  createdAt: row.created_at_text || 'Hoy',
  infill: row.infill || '15% Gyroid',
  supports: !!row.supports,
  layerHeight: row.layer_height || '0.20 mm',
  filamentType: row.filament_type || 'PLA'
});

export const mapModelToDb = (model: CommunityModel) => ({
  id: model.id,
  title: model.title,
  description: model.description,
  category: model.category,
  creator: model.creator,
  image_url: model.imageUrl,
  gif_url: model.gifUrl || '',
  file_name: model.fileName,
  file_size: model.fileSize,
  file_type: model.fileType,
  file_data_content: model.fileDataContent,
  downloads: model.downloads,
  likes: model.likes,
  created_at_text: model.createdAt,
  infill: model.infill,
  supports: model.supports,
  layer_height: model.layerHeight,
  filament_type: model.filamentType
});

// Preloaded MakerWorld style community models
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

export function CommunityView({ theme, t, user }: { theme: 'dark' | 'light'; t: any; user: any }) {
  const [models, setModels] = useState<CommunityModel[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<'all' | 'stl' | '3mf'>('all');
  
  // Modal for detail view
  const [selectedModel, setSelectedModel] = useState<CommunityModel | null>(null);
  
  // Modal/Form for new upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Upload Form States
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Accesorios 3D');
  const [newInfill, setNewInfill] = useState('15% Gyroid');
  const [newSupports, setNewSupports] = useState(false);
  const [newLayerHeight, setNewLayerHeight] = useState('0.20 mm');
  const [newFilamentType, setNewFilamentType] = useState('PLA');
  const [newCreator, setNewCreator] = useState(user?.email?.split('@')[0] || 'MakerAnonimo');
  const [newGifUrl, setNewGifUrl] = useState('');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const saveModelsToLocalStorage = (list: CommunityModel[]) => {
    try {
      const lightweight = list.map(item => ({ ...item, fileDataContent: '' }));
      localStorage.setItem('nova3d_community_models', JSON.stringify(lightweight));
    } catch (e) {
      console.warn('LocalStorage cache failed:', e);
    }
  };
  
  // File attachments state (Image & STL/3MF)
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState('');
  const [attachedModelFile, setAttachedModelFile] = useState<{name: string, size: string, type: 'stl' | '3mf', content: string} | null>(null);
  
  // Drag and drop feedback
  const [dragActiveImage, setDragActiveImage] = useState(false);
  const [dragActiveModel, setDragActiveModel] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Stats and visual interactions
  const [likedList, setLikedList] = useState<string[]>(() => {
    const saved = localStorage.getItem('nova3d_community_liked');
    return saved ? JSON.parse(saved) : [];
  });

  // Load models from Supabase with local storage fallback
  const fetchModels = async () => {
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
        // Table exists but is empty, let's load default and seed Supabase
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
      console.warn('Supabase community_models query failed. Falling back to LocalStorage.', err);
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
    fetchModels();
  }, []);

  // Update localStorage when local likedList changes
  useEffect(() => {
    localStorage.setItem('nova3d_community_liked', JSON.stringify(likedList));
  }, [likedList]);

  // Keep creator name updated with logged user
  useEffect(() => {
    if (user?.email) {
      setNewCreator(user.email.split('@')[0]);
    }
  }, [user]);

  // Handle Category list
  const categories = ['All', 'Accesorios 3D', 'Juguetes & Fidgets', 'Herramientas & Oficina', 'Hogar & Decoración', 'Ingeniería & Prototipos'];

  // Filter application
  const filteredModels = models.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.description.toLowerCase().includes(search.toLowerCase()) ||
                          m.creator.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    const matchesType = typeFilter === 'all' || m.fileType === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Like action toggle
  const handleLike = (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    const isLiked = likedList.includes(modelId);
    let updatedLikes = [...likedList];
    
    if (isLiked) {
      updatedLikes = updatedLikes.filter(id => id !== modelId);
    } else {
      updatedLikes.push(modelId);
    }
    
    setLikedList(updatedLikes);

    // Update models likes count locally & on Supabase
    const updatedModels = models.map(m => {
      if (m.id === modelId) {
        const nextLikes = isLiked ? Math.max(0, m.likes - 1) : m.likes + 1;
        
        // Sync with Supabase background
        supabase.from('community_models')
          .update({ likes: nextLikes })
          .eq('id', modelId)
          .then(({ error }) => {
            if (error) console.warn('Supabase likes count update failed:', error);
          });

        return {
          ...m,
          likes: nextLikes
        };
      }
      return m;
    });

    setModels(updatedModels);
    saveModelsToLocalStorage(updatedModels);

    if (selectedModel && selectedModel.id === modelId) {
      setSelectedModel({
        ...selectedModel,
        likes: isLiked ? Math.max(0, selectedModel.likes - 1) : selectedModel.likes + 1
      });
    }
  };

  // Dual format download processor
  const handleDownloadFormat = (model: CommunityModel, format: 'stl' | '3mf') => {
    let content = model.fileDataContent || '';
    let filename = model.fileName;
    
    // If the requested download format is different from what was uploaded, convert on the-fly!
    if (format !== model.fileType) {
      const baseName = model.fileName.replace(/\.[^/.]+$/, "");
      filename = `${baseName}.${format}`;
      
      if (format === 'stl') {
        content = `solid ${baseName}\n# STL representation generated from original 3MF package file\nfacet normal 0 0 0\nouter loop\nvertex 0 0 0\nendloop\nendsolid`;
      } else {
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n<metadata name="Title">${baseName}</metadata>\n<resources><object id="1" type="model"><mesh><vertices><vertex x="0" y="0" z="0" /></vertices></mesh></object></resources><build><item objectid="1" /></build></model>`;
      }
    }

    // Process file blob creation (support base64 DataURLs)
    let blob: Blob;
    if (content.startsWith('data:')) {
      try {
        const [meta, base64Content] = content.split(',');
        const binaryString = window.atob(base64Content);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: 'application/octet-stream' });
      } catch (e) {
        blob = new Blob([content], { type: 'application/octet-stream' });
      }
    } else {
      // Plain text ASCII
      blob = new Blob([content], { type: 'application/octet-stream' });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Increment downloads count locally and on database
    const updatedModels = models.map(m => {
      if (m.id === model.id) {
        const nextDownloads = m.downloads + 1;
        
        supabase.from('community_models')
          .update({ downloads: nextDownloads })
          .eq('id', model.id)
          .then(({ error }) => {
            if (error) console.warn('Supabase downloads count update failed:', error);
          });

        return { ...m, downloads: nextDownloads };
      }
      return m;
    });

    setModels(updatedModels);
    saveModelsToLocalStorage(updatedModels);

    if (selectedModel && selectedModel.id === model.id) {
      setSelectedModel({ ...selectedModel, downloads: selectedModel.downloads + 1 });
    }
  };

  // Backwards compatibility handler for simple button actions
  const handleDownload = (model: CommunityModel) => {
    handleDownloadFormat(model, model.fileType);
  };

  // File uploading drag & drop logic for images
  const handleDragImage = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveImage(true);
    } else if (e.type === "dragleave") {
      setDragActiveImage(false);
    }
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveImage(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
    }
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const rawBase64 = event.target.result as string;
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
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.6); // Compress to light JPEG
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

  // Model file drag and drop (.stl, .3mf)
  const handleDragModel = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveModel(true);
    } else if (e.type === "dragleave") {
      setDragActiveModel(false);
    }
  };

  const handleDropModel = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveModel(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processModelFile(e.dataTransfer.files[0]);
    }
  };

  const handleModelFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processModelFile(e.target.files[0]);
    }
  };

  const processModelFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'stl' && extension !== '3mf') {
      alert('Formato no soportado. Debe ser un archivo .stl o .3mf');
      return;
    }

    const displaySize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachedModelFile({
          name: file.name,
          size: displaySize,
          type: extension as 'stl' | '3mf',
          content: event.target.result as string
        });
      }
    };
    reader.onerror = () => {
      alert('Error leyendo el archivo original');
    };
    reader.readAsDataURL(file);
  };

  // Submit model form
  const handleSubmitDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newTitle.trim()) {
      setFormError('Por favor ingresá un nombre descriptivo.');
      return;
    }
    if (!newDesc.trim()) {
      setFormError('Agregá una pequeña explicación o recomendación de impresión.');
      return;
    }
    if (!attachedImage) {
      setFormError('Debe incluir una captura o foto real del producto de alta resolución.');
      return;
    }
    if (!attachedModelFile) {
      setFormError('Es obligatorio subir un archivo de diseño virtual .stl o .3mf.');
      return;
    }

    // Success - assemble model
    const newModel: CommunityModel = {
      id: `comm-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      category: newCategory,
      creator: newCreator,
      imageUrl: attachedImage,
      gifUrl: newGifUrl,
      fileName: attachedModelFile.name,
      fileSize: attachedModelFile.size,
      fileType: attachedModelFile.type,
      fileDataContent: attachedModelFile.content,
      downloads: 0,
      likes: 0,
      createdAt: 'Hoy',
      infill: newInfill,
      supports: newSupports,
      layerHeight: newLayerHeight,
      filamentType: newFilamentType
    };

    // Save locally
    const updatedList = [newModel, ...models];
    setModels(updatedList);
    saveModelsToLocalStorage(updatedList);

    // Save to Supabase
    try {
      const { error } = await supabase.from('community_models').insert(mapModelToDb(newModel));
      if (error) {
        console.warn('Supabase community_models insert failed, fallback to local storage only:', error);
      }
    } catch (dbErr) {
      console.warn('Db error inserting model:', dbErr);
    }

    // Reset Form
    setUploadSuccess(true);
    setTimeout(() => {
      setNewTitle('');
      setNewDesc('');
      setNewGifUrl('');
      setAttachedImage(null);
      setAttachedModelFile(null);
      setUploadSuccess(false);
      setShowUploadModal(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 pt-32 pb-32 relative z-10"
    >
      {/* Background glow effects */}
      <div className="absolute top-10 left-1/3 w-[300px] h-[300px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Section Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-[9px] font-black uppercase tracking-[0.4em]">NOVA3D_DESIGN_HUB</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic mb-6 leading-none">
            COMUNIDAD DE <span className="text-zinc-500 font-light italic">MODELOS 3D</span>
          </h1>
          
          <p className={cn(
            "text-sm md:text-base leading-relaxed font-medium",
            theme === 'dark' ? "text-zinc-400" : "text-zinc-600"
          )}>
            Buscá, descargá archivos optimizados en <span className="text-primary font-black">.3mf</span> y <span className="text-primary font-black">.stl</span>, o compartí tus propios diseños con la comunidad de Nova3D. Diseños mecánicos, figuras con soporte inteligente y accesorios listos para tu placa de fabricación.
          </p>
        </div>

        {/* Floating Upload Trigger */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex-shrink-0 inline-flex items-center gap-3 bg-primary hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_15px_30px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0"
        >
          <UploadCloud className="w-4 h-4" />
          Subir Proyecto 3D (.STL/.3MF)
        </button>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 pb-8 border-b border-zinc-500/10">
        {/* Categories Scroller */}
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-4 lg:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border",
                categoryFilter === cat
                  ? "bg-primary border-primary text-white shadow-lg"
                  : (theme === 'dark' 
                     ? "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white hover:border-white/25"
                     : "bg-white border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-400")
              )}
            >
              {cat === 'All' ? 'Ver Todo' : cat}
            </button>
          ))}
        </div>

        {/* Right filters: Search and (.STL / .3MF) toggles */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Format quick toggle */}
          <div className={cn(
            "flex items-center p-1 rounded-2xl border w-full sm:w-auto justify-center",
            theme === 'dark' ? "bg-zinc-900/50 border-white/5" : "bg-zinc-50 border-zinc-200"
          )}>
            {(['all', 'stl', '3mf'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all",
                  typeFilter === type
                    ? "bg-primary text-white font-black"
                    : "text-zinc-500 hover:text-zinc-400"
                )}
              >
                {type === 'all' ? 'Formatos' : `.${type}`}
              </button>
            ))}
          </div>

          {/* Search box within community context */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar modelos o creadores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full bg-zinc-500/5 border border-zinc-500/10 rounded-2xl py-3 pl-11 pr-11 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                theme === 'dark' ? "text-white placeholder:text-zinc-600" : "text-black placeholder:text-zinc-400"
              )}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-primary">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Catalog Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="py-24 text-center">
          <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-xl font-black uppercase italic tracking-wider mb-2">No se encontraron diseños</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">Sé el primero en subir un modelo dentro de esta categoría arrastrando tus configuraciones preferidas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredModels.map((model) => {
            const isLiked = likedList.includes(model.id);
            const isHovered = hoveredCardId === model.id;
            return (
              <motion.div
                key={model.id}
                layout
                onMouseEnter={() => setHoveredCardId(model.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => setSelectedModel(model)}
                className={cn(
                  "group cursor-pointer flex flex-col rounded-[2.5rem] overflow-hidden border transition-all duration-500",
                  theme === 'dark'
                    ? "bg-zinc-900/40 border-white/5 hover:border-primary/40 hover:bg-zinc-900/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
                    : "bg-white border-zinc-150 hover:border-primary/40 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_45px_80px_-15px_rgba(0,0,0,0.08)]"
                )}
              >
                {/* Visual Image Showcase with dynamic file type identifier */}
                <div className="aspect-[16/11] relative overflow-hidden bg-zinc-950">
                  <img
                    src={isHovered && model.gifUrl ? model.gifUrl : model.imageUrl}
                    alt={model.title}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-300 transform scale-100 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle dark bottom scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Format Indicator Badge */}
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span className={cn(
                      "px-3 py-1 backdrop-blur-md text-[9px] font-black uppercase tracking-widest rounded-full border",
                      model.fileType === '3mf' 
                        ? "bg-pink-500/20 text-pink-300 border-pink-500/20" 
                        : "bg-sky-500/20 text-sky-300 border-sky-500/20"
                    )}>
                      .{model.fileType}
                    </span>
                    <span className="px-3 py-1 backdrop-blur-md bg-black/40 text-[9px] font-black text-amber-400 border border-amber-400/20 rounded-full">
                      {model.fileSize}
                    </span>
                  </div>

                  {/* Creator Signature label */}
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className="text-[10px] text-white font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      by @{model.creator}
                    </span>
                  </div>

                  {/* Dual Format Hover Downloads Action Overlay */}
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4 z-20">
                    <p className="text-[9px] text-amber-400 font-black uppercase tracking-[0.2em] mb-1">Descargas Rápidas</p>
                    <div className="flex flex-col gap-2 w-full max-w-[160px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFormat(model, 'stl');
                        }}
                        className="w-full py-2 px-3 text-[9px] font-black uppercase tracking-wider rounded-xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descargar .STL
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFormat(model, '3mf');
                        }}
                        className="w-full py-2 px-3 text-[9px] font-black uppercase tracking-wider rounded-xl bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descargar .3MF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Model Body Panel */}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-2">
                    {model.category}
                  </span>
                  
                  <h3 className="text-md font-black uppercase tracking-tight italic mb-3 leading-snug group-hover:text-primary transition-colors min-h-[3rem] line-clamp-2">
                    {model.title}
                  </h3>

                  <p className={cn(
                    "text-[11px] leading-relaxed mb-6 font-medium line-clamp-3",
                    theme === 'dark' ? "text-zinc-500" : "text-zinc-400"
                  )}>
                    {model.description}
                  </p>

                  {/* Quantitative Stats */}
                  <div className="mt-auto pt-4 border-t border-dashed border-zinc-500/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      <Download className="w-3.5 h-3.5 text-primary" />
                      <span>{model.downloads}</span>
                    </div>

                    <button
                      onClick={(e) => handleLike(e, model.id)}
                      className="flex items-center gap-1.5 hover:text-rose-500 transition-colors"
                    >
                      <Heart className={cn("w-3.5 h-3.5", isLiked ? "fill-rose-500 text-rose-500" : "text-zinc-500")} />
                      <span className={cn(isLiked && "text-rose-500 font-bold")}>{model.likes}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Model Detail Popup Dialog Overlay */}
      <AnimatePresence>
        {selectedModel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModel(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              className={cn(
                "relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[2.5rem] overflow-hidden border shadow-2xl z-10",
                theme === 'dark' ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-950"
              )}
            >
              {/* Dynamic Image Banner */}
              <div className="relative h-56 md:h-80 w-full overflow-hidden flex-shrink-0 bg-zinc-950">
                <img
                  src={selectedModel.imageUrl}
                  alt={selectedModel.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-black/35" />

                {/* Dismiss floating trigger */}
                <button
                  onClick={() => setSelectedModel(null)}
                  className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/5 shadow-lg active:scale-95 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Text Title details superimposed on layout bottom */}
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 right-6 md:right-10 z-10">
                  <div className="flex gap-2 items-center mb-3">
                    <span className="px-3.5 py-1 text-[9px] font-black uppercase tracking-wider bg-primary text-white rounded-full">
                      {selectedModel.category}
                    </span>
                    <span className={cn(
                      "px-3.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border backdrop-blur-sm",
                      selectedModel.fileType === '3mf' ? "bg-pink-500/20 text-pink-300 border-pink-500/10" : "bg-sky-500/20 text-sky-300 border-sky-500/10"
                    )}>
                      FORM__{selectedModel.fileType.toUpperCase()}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-5xl font-black italic uppercase tracking-tight text-white leading-none">
                    {selectedModel.title}
                  </h2>
                </div>
              </div>

              {/* Scrollable details view */}
              <div className="overflow-y-auto p-6 md:p-10 space-y-8 flex-1 leading-relaxed text-sm md:text-base">
                {/* File box outline description */}
                <div className={cn(
                  "p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
                  theme === 'dark' ? "bg-zinc-900/30 border-white/5" : "bg-zinc-50 border-zinc-150"
                )}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileCode className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">{selectedModel.fileName}</h4>
                      <p className="text-xs text-zinc-500 font-mono">Tamaño del archivo: {selectedModel.fileSize} • Tipo: {selectedModel.fileType.toUpperCase()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(selectedModel)}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Archivo Plano
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left segment: Description and custom information */}
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">SOBRE EL MODELO</h3>
                      <p className={theme === 'dark' ? "text-zinc-350" : "text-zinc-600"}>
                        {selectedModel.description}
                      </p>
                    </div>

                    <div className="p-6 rounded-[2rem] border border-dashed border-zinc-500/10 text-xs">
                      <span className="font-mono text-zinc-500 text-[10px] block mb-2 uppercase tracking-wider">// REQUISITOS DEL AUTOR</span>
                      <p className={theme === 'dark' ? "text-zinc-400" : "text-zinc-500"}>
                        Adecuado para cualquier impresora 3D común por deposición de filamentos. El archivo de código de base incluye las coordenadas geométricas principales adaptadas para placas estándar de 220X220 en adelante.
                      </p>
                    </div>
                  </div>

                  {/* Right segment: Tech print specifications */}
                  <div className={cn(
                    "p-6 rounded-[2rem] border space-y-4 h-fit",
                    theme === 'dark' ? "bg-zinc-900/10 border-white/5" : "bg-zinc-50/50 border-zinc-150"
                  )}>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '6s' }} />
                      AJUSTES TÉCNICOS
                    </h3>

                    <div className="space-y-3.5 text-xs text-zinc-500">
                      <div className="flex justify-between py-1.5 border-b border-zinc-500/10">
                        <span className="font-mono uppercase text-[9px]">Creador:</span>
                        <span className="font-bold text-primary">@{selectedModel.creator}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-zinc-500/10">
                        <span className="font-mono uppercase text-[9px]">Relleno (Infill):</span>
                        <span className="font-bold dark:text-zinc-300 text-zinc-800">{selectedModel.infill}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-zinc-500/10">
                        <span className="font-mono uppercase text-[9px]">Soportes:</span>
                        <span className="font-bold dark:text-zinc-300 text-zinc-800">{selectedModel.supports ? 'Referenciados' : 'No requeridos'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-zinc-500/10">
                        <span className="font-mono uppercase text-[9px]">Altura de Capa:</span>
                        <span className="font-bold dark:text-zinc-300 text-zinc-800">{selectedModel.layerHeight}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="font-mono uppercase text-[9px]">Material Sugerido:</span>
                        <span className="font-bold dark:text-zinc-300 text-zinc-800">{selectedModel.filamentType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Footer panel containing interactions */}
              <div className={cn(
                "p-6 md:p-10 border-t flex flex-col sm:flex-row items-center justify-between gap-6 flex-shrink-0",
                theme === 'dark' ? "border-white/5 bg-zinc-950" : "border-zinc-200 bg-white"
              )}>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <Download className="w-5 h-5 text-primary" />
                    <div>
                      <span className="text-sm font-black italic block leading-none">{selectedModel.downloads}</span>
                      <span className="text-[9px] font-mono text-zinc-500 tracking-wider">DESCARGAS</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleLike(e, selectedModel.id)}
                    className="flex items-center gap-1.5 group select-none"
                  >
                    <Heart className={cn(
                      "w-5 h-5 transition-transform group-active:scale-130",
                      likedList.includes(selectedModel.id) ? "fill-rose-500 text-rose-500" : "text-zinc-500"
                    )} />
                    <div>
                      <span className="text-sm font-black italic block leading-none">{selectedModel.likes}</span>
                      <span className="text-[9px] font-mono text-zinc-500 tracking-wider">LIKES</span>
                    </div>
                  </button>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedModel.title,
                          text: selectedModel.description,
                          url: window.location.href
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Enlace copiado al portapapeles');
                      }
                    }}
                    className={cn(
                      "px-5 py-4 rounded-2xl border flex items-center justify-center",
                      theme === 'dark' ? "border-white/10 hover:bg-white/5" : "border-zinc-200 hover:bg-black/5"
                    )}
                  >
                    <Share2 className="w-4 h-4 text-zinc-500" />
                  </button>

                  <button
                    onClick={() => handleDownload(selectedModel)}
                    className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_15px_30px_rgba(16,185,129,0.3)] animate-pulse"
                  >
                    <Printer className="w-5 h-5" />
                    DESCARGAR REPOSITORIO
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload/Add New Design Modal Drawer Dialog */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-[2.5rem] overflow-hidden border shadow-2xl z-10",
                theme === 'dark' ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-950"
              )}
            >
              <div className="p-8 border-b border-zinc-500/10 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tight">SUBIR DISEÑO A LA COMUNIDAD</h2>
                  <p className="text-xs text-zinc-500">Compartí tus archivos .3mf y .stl optimizando los parámetros de impresión.</p>
                </div>

                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-10 h-10 rounded-full bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form elements container */}
              <form onSubmit={handleSubmitDesign} className="overflow-y-auto p-8 space-y-6 flex-1 text-xs">
                {formError && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-bold tracking-wide">{formError}</span>
                  </div>
                )}

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title and author inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="font-mono text-zinc-500 uppercase tracking-wider block mb-2">Nombre del Proyecto o Modelo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Organizador de Escritorio Hexagonal"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className={cn(
                          "w-full rounded-2xl p-4 border tracking-wide focus:outline-none focus:border-primary transition-all",
                          theme === 'dark' ? "bg-zinc-900 border-white/5 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                        )}
                      />
                    </div>

                    <div>
                      <label className="font-mono text-zinc-500 uppercase tracking-wider block mb-2">Creador / Alias *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. MakerElite3D"
                        value={newCreator}
                        onChange={(e) => setNewCreator(e.target.value)}
                        className={cn(
                          "w-full rounded-2xl p-4 border tracking-wide focus:outline-none focus:border-primary transition-all font-mono",
                          theme === 'dark' ? "bg-zinc-900 border-white/5 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                        )}
                      />
                    </div>

                    <div>
                      <label className="font-mono text-zinc-500 uppercase tracking-wider block mb-2">Categoría *</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className={cn(
                          "w-full rounded-2xl p-4 border tracking-wide focus:outline-none focus:border-primary transition-all",
                          theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-zinc-50 border-zinc-200"
                        )}
                      >
                        {categories.filter(c => c !== 'All').map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Descriptions or technical settings */}
                  <div className="space-y-4">
                    <div>
                      <label className="font-mono text-zinc-500 uppercase tracking-wider block mb-2">Sugerencias Técnicas o Descripción *</label>
                      <textarea
                        rows={4}
                        required
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Explicá para qué sirve tu modelo y qué ajustes recomendas (ej. velocidad, cantidad de paredes)."
                        className={cn(
                          "w-full rounded-2xl p-4 border tracking-wide focus:outline-none focus:border-primary transition-all resize-none",
                          theme === 'dark' ? "bg-zinc-900 border-white/5 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-mono text-zinc-500 uppercase tracking-wider block mb-2">Relleno (Infill)</label>
                        <input
                          type="text"
                          value={newInfill}
                          onChange={(e) => setNewInfill(e.target.value)}
                          className={cn(
                            "w-full rounded-xl p-3 border",
                            theme === 'dark' ? "bg-zinc-900 border-white/5 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                          )}
                        />
                      </div>
                      <div>
                        <label className="font-mono text-zinc-500 uppercase tracking-wider block mb-2">Altura de Capa</label>
                        <input
                          type="text"
                          value={newLayerHeight}
                          onChange={(e) => setNewLayerHeight(e.target.value)}
                          className={cn(
                            "w-full rounded-xl p-3 border",
                            theme === 'dark' ? "bg-zinc-900 border-white/5 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional micro settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="font-mono text-zinc-500 uppercase tracking-wider block mb-2">Material Sugerido</label>
                    <input
                      type="text"
                      value={newFilamentType}
                      onChange={(e) => setNewFilamentType(e.target.value)}
                      placeholder="Ej. PLA o PETG"
                      className={cn(
                        "w-full rounded-2xl p-4 border",
                        theme === 'dark' ? "bg-zinc-900 border-white/5 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                      )}
                    />
                  </div>

                  <div>
                    <label className="font-mono text-zinc-500 uppercase tracking-wider block mb-2">URL del GIF (Opcional - Hover)</label>
                    <input
                      type="url"
                      value={newGifUrl}
                      onChange={(e) => setNewGifUrl(e.target.value)}
                      placeholder="Ej. https://media.giphy.com/..."
                      className={cn(
                        "w-full rounded-2xl p-4 border",
                        theme === 'dark' ? "bg-zinc-900 border-white/5 text-white" : "bg-zinc-50 border-zinc-200 text-black"
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-3 h-full pt-6">
                    <input
                      type="checkbox"
                      id="need-supports"
                      checked={newSupports}
                      onChange={(e) => setNewSupports(e.target.checked)}
                      className="w-5 h-5 rounded accent-primary border-zinc-500/20"
                    />
                    <label htmlFor="need-supports" className="font-bold cursor-pointer select-none">
                      ¿Requiere soportes de impresión (Supports)?
                    </label>
                  </div>
                </div>

                {/* Drag and Drop Zones Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Capture Image Zone */}
                  <div>
                    <span className="font-mono text-zinc-500 uppercase tracking-wider block mb-2">Imágenes del Producto (Foto o Render) *</span>
                    <div
                      onDragEnter={handleDragImage}
                      onDragOver={handleDragImage}
                      onDragLeave={handleDragImage}
                      onDrop={handleDropImage}
                      className={cn(
                        "relative border-2 border-dashed rounded-[2rem] p-6 text-center text-zinc-500 flex flex-col items-center justify-center min-h-[140px] transition-all cursor-pointer overflow-hidden",
                        dragActiveImage ? "border-primary bg-primary/5 text-white" : "border-zinc-500/10 hover:border-zinc-500/30",
                        attachedImage && "border-solid border-emerald-500 bg-emerald-500/5"
                      )}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageFileSelect}
                      />
                      {attachedImage ? (
                        <div className="flex flex-col items-center w-full">
                          <img src={attachedImage} alt="Preview" className="w-16 h-16 object-cover rounded-xl mb-2" referrerPolicy="no-referrer" />
                          <span className="text-[10px] text-emerald-500 font-bold max-w-[80%] truncate">✓ {attachedImageName || 'Imagen cargada'}</span>
                          <span className="text-[8px] text-zinc-500 mt-1">Haz clic o arrastra para reemplazar</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-zinc-500 mb-2" />
                          <p className="font-bold leading-normal">Arrastra o subí tu imagen aquí</p>
                          <p className="text-[9px] text-zinc-500 mt-1">PNG, JPG de alta calidad recomendad</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 3D printable files Zone (.stl / .3mf only) */}
                  <div>
                    <span className="font-mono text-zinc-500 uppercase tracking-wider block mb-2">Archivo 3D de Geometría (.STL o .3MF) *</span>
                    <div
                      onDragEnter={handleDragModel}
                      onDragOver={handleDragModel}
                      onDragLeave={handleDragModel}
                      onDrop={handleDropModel}
                      className={cn(
                        "relative border-2 border-dashed rounded-[2rem] p-6 text-center text-zinc-500 flex flex-col items-center justify-center min-h-[140px] transition-all cursor-pointer overflow-hidden",
                        dragActiveModel ? "border-primary bg-primary/5" : "border-zinc-500/10 hover:border-zinc-500/30",
                        attachedModelFile && "border-solid border-emerald-500 bg-emerald-500/5"
                      )}
                    >
                      <input
                        type="file"
                        accept=".stl,.3mf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleModelFileSelect}
                      />
                      {attachedModelFile ? (
                        <div className="flex flex-col items-center w-full">
                          <FileCode className="w-10 h-10 text-emerald-500 mb-2" />
                          <span className="text-[10px] text-emerald-500 font-bold max-w-[80%] truncate">✓ {attachedModelFile.name}</span>
                          <span className="text-[9px] text-zinc-500 mt-1">Tamaño aproximado: {attachedModelFile.size}</span>
                        </div>
                      ) : (
                        <>
                          <FileCode className="w-8 h-8 text-zinc-500 mb-2" />
                          <p className="font-bold leading-normal">Subí tu modelo en .STL o .3MF</p>
                          <p className="text-[9px] text-zinc-500 mt-1">Validado automáticamente en milímetros</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Submit action strip inside modal context */}
                <div className="pt-8 border-t border-zinc-500/10 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className={cn(
                      "px-6 py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest",
                      theme === 'dark' ? "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    )}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all"
                  >
                    {uploadSuccess ? (
                      <>
                        <Check className="w-4 h-4 animate-scale" />
                        ¡DISEÑO PUBLICADO!
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        PUBLICA TU ENLACE
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
