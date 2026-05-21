import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Ruler, Package, Brush, Zap, Info, ChevronDown, 
  CheckCircle2, FileText, X, Search, Box, ShoppingCart, 
  Send, History, HelpCircle, Layers, MousePointer2 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Product } from '../../types';

const PRODUCT_CATEGORIES = [
  { id: '3D_PRINTING', label: 'Impresión 3D', icon: Box, active: true },
  { id: 'CNC', label: 'Mecanizado CNC', icon: Package },
  { id: 'MECHATRONIC', label: 'Piezas mecatrónicas', icon: Ruler },
  { id: 'PCB_STANDARD', label: 'PCB/PCBA estándar', icon: Layers },
  { id: 'PCB_ADVANCED', label: 'PCB/PCBA avanzado', icon: Layers },
  { id: 'SMT_TEMPLATE', label: 'Plantilla SMT', icon: Layers },
  { id: 'FLEX_HEATER', label: 'Calentador flexible', icon: Zap },
];

const PRINT_TYPES = [
  { id: 'LLAVERO', label: 'Llaveros', active: true },
  { id: 'MUNECO', label: 'Muñecos' },
  { id: 'FIGURA', label: 'Figuras' },
  { id: 'BUSTO', label: 'Bustos' },
  { id: 'ARTICULABLE', label: 'Articulables' },
  { id: 'MAQUETA', label: 'Maquetas' },
  { id: 'JOYA', label: 'Joyas' },
  { id: 'HERRAMIENTA', label: 'Herramientas' },
  { id: 'BASE', label: 'Bases' },
  { id: 'LAMPARA', label: 'Lámparas' },
];

const MATERIALS = [
  { id: 'PLA', label: 'PLA (Estándar)', recommended: true },
  { id: 'PLA_SILK', label: 'PLA Silk (Brillante)' },
  { id: 'ABS', label: 'ABS (Resistente)' },
  { id: 'PETG', label: 'PETG (Equilibrado)' },
  { id: 'FLEX_TPU', label: 'TPU (Flexible)' },
  { id: 'NYLON', label: 'Nylon (Industrial)' },
  { id: 'WOOD', label: 'Madera (Compuesto)' },
  { id: 'CARBON_FIBER', label: 'Fibra de Carbono' },
  { id: 'RESINA_STD', label: 'Resina Estándar' },
  { id: 'RESINA_TOUGH', label: 'Resina Tough (Rígida)' },
];

const COLORS = [
  { id: 'WHITE', label: 'Blanco', value: '#ffffff' },
  { id: 'BLACK', label: 'Negro', value: '#1a1a1a' },
  { id: 'GRAY', label: 'Gris', value: '#808080' },
  { id: 'RED', label: 'Rojo', value: '#ef4444' },
  { id: 'CRIMSON', label: 'Carmesí', value: '#991b1b' },
  { id: 'BLUE', label: 'Azul', value: '#3b82f6' },
  { id: 'NAVY', label: 'Azul Marino', value: '#1e3a8a' },
  { id: 'GREEN', label: 'Verde', value: '#22c55e' },
  { id: 'EMERALD', label: 'Esmeralda', value: '#065f46' },
  { id: 'YELLOW', label: 'Amarillo', value: '#fbce07' },
  { id: 'ORANGE', label: 'Naranja', value: '#f97316' },
  { id: 'PURPLE', label: 'Morado', value: '#a855f7' },
  { id: 'PINK', label: 'Rosa', value: '#ec4899' },
  { id: 'GOLD', label: 'Dorado', value: '#d4af37' },
  { id: 'SILVER', label: 'Plateado', value: '#c0c0c0' },
  { id: 'COPPER', label: 'Cobre', value: '#b87333' },
  { id: 'BRONZE', label: 'Bronce', value: '#cd7f32' },
  { id: 'CLEAR', label: 'Transparente', value: 'transparent' },
];

const SURFACE_FINISHES = [
  { id: 'NONE', label: 'No' },
  { id: 'YES', label: 'Sí' },
];

const SANDING_OPTIONS = [
  { id: 'SANDING', label: 'Sanding' },
  { id: 'POLISHING', label: 'Polishing' },
  { id: 'PAINTING', label: 'Painting' },
];

const MODEL_OPTIONS = [
  { id: 'LLAVERO', label: 'Llaveros y Pins', multiplier: 0.7, icon: Package, desc: 'Piezas miniatura con argolla.' },
  { id: 'FUNCIONAL', label: 'Repuestos / Soporte', multiplier: 0.9, icon: Ruler, desc: 'Piezas mecánicas o funcionales.' },
  { id: 'CUADRO', label: 'Cuadros / Deco', multiplier: 1.0, icon: Box, desc: 'Relieves, logos o paneles.' },
  { id: 'MUNECO', label: 'Muñecos / Juguetes', multiplier: 1.2, icon: Brush, desc: 'Figuras de acción o decoración.' },
  { id: 'ESCULTURA', label: 'Escultura / Arte', multiplier: 1.5, icon: Zap, desc: 'Alta resolución y detalle orgánico.' },
  { id: 'LITOFANIA', label: 'Litofanía', multiplier: 1.3, icon: Info, desc: 'Fotos impresas en relieve.' }
];

const BASE_FILAMENT_PRICE_KG = 24000;
const PRICE_PER_GRAM = BASE_FILAMENT_PRICE_KG / 1000;
const OP_COST_PER_HOUR = 350;
const DESIGN_BASE_FEE = 4500;
const KEYCHAIN_RING_COST = 350;
const KEYCHAIN_MIN_PRICE = 4500;

interface QuoteViewProps {
  products?: Product[];
  addToCart: (product: any, quantity: number) => void;
  t: any;
  theme: string;
}

export function QuoteView({ products = [], addToCart, theme }: QuoteViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('3D_PRINTING');
  const [formData, setFormData] = useState({
    width: 10,
    height: 10,
    depth: 10,
    printType: 'LLAVERO',
    material: 'PLA',
    colors: ['WHITE'],
    hasSurfaceFinish: 'NONE',
    finishType: 'SANDING',
    isDesigned: true,
    quantity: 1,
    comment: '',
    acceptedTerms: true,
    selectedProductId: ''
  });

  const [estimate, setEstimate] = useState(0.31);
  const [fullPriceTotal, setFullPriceTotal] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [weight, setWeight] = useState(0);
  const [printTime, setPrintTime] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDiscountInfo = (q: number) => {
    const discounts = [
      { min: 5000, discount: 0.65, label: 'Distribuidor MASTER' },
      { min: 1000, discount: 0.55, label: 'Mayorista PLATINUM' },
      { min: 500, discount: 0.45, label: 'Mayorista GOLD' },
      { min: 300, discount: 0.35, label: 'Pack CORPORATIVO' },
      { min: 100, discount: 0.25, label: 'Pack EMPRENDEDOR' },
      { min: 50, discount: 0.15, label: 'Pack PROMO' },
      { min: 25, discount: 0.10, label: 'Pack EQUIPO' },
      { min: 10, discount: 0.05, label: 'Small Batch' },
      { min: 0, discount: 0, label: 'Venta Minorista' }
    ];
    return discounts.find(d => q >= d.min) || discounts[discounts.length - 1];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFormData(prev => ({ ...prev, selectedProductId: '' }));
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProduct = products.find(p => p.id === formData.selectedProductId);

  useEffect(() => {
    // Cálculo de volumen y estimación técnica
    const volume = formData.width * formData.height * formData.depth;
    const estWeight = volume * 0.35; // g/cm3
    const estTime = estWeight / 15; // 15g/hora

    const printTypeObj = PRINT_TYPES.find(m => m.id === formData.printType);
    // Since we don't have multipliers for the new types yet, we can use a default or map them
    const multiplier = 1.0; 

    let materialCost = estWeight * PRICE_PER_GRAM;
    let machineCost = estTime * OP_COST_PER_HOUR;
    const designCost = formData.isDesigned ? 0 : DESIGN_BASE_FEE;

    let baseUnitPrice = (materialCost + machineCost + designCost) * multiplier;

    if (formData.printType === 'LLAVERO') {
      baseUnitPrice += KEYCHAIN_RING_COST;
      if (formData.isDesigned) {
        baseUnitPrice = Math.max(baseUnitPrice, KEYCHAIN_MIN_PRICE);
      }
    }

    const discountInfo = getDiscountInfo(formData.quantity);
    let discountedUnitPrice = baseUnitPrice * (1 - discountInfo.discount);
    
    // Special Keychain Promo
    if (formData.printType === 'LLAVERO' && formData.quantity >= 20) {
      discountedUnitPrice = Math.min(discountedUnitPrice, 1500);
    }
    
    setWeight(Math.round(estWeight * formData.quantity));
    setPrintTime(Math.round(estTime * formData.quantity * 10) / 10);
    setUnitPrice(Math.round(discountedUnitPrice));
    setFullPriceTotal(Math.round(baseUnitPrice * formData.quantity));
    setEstimate(Math.round((discountedUnitPrice * formData.quantity) / 10) * 10);
  }, [formData, selectedProduct]);

  const handleQuoteAddToCart = () => {
    const typeLabel = PRINT_TYPES.find(m => m.id === formData.printType)?.label || 'Pieza 3D';
    
    // Create a virtual product for the custom quote
    const virtualProduct = {
      id: `custom-${Date.now()}`,
      name: `Personalizado: ${selectedProduct ? selectedProduct.name : typeLabel}`,
      description: `Medidas: ${formData.width}x${formData.height}x${formData.depth}cm. Material: ${formData.material}.`,
      price: unitPrice,
      images: selectedProduct ? selectedProduct.images : (selectedFile ? [URL.createObjectURL(selectedFile)] : []),
      category: 'CUSTOM'
    };

    addToCart(virtualProduct, formData.quantity);
    
    // Show a small animation or feedback could go here
    alert("Agregado al carrito exitosamente");
  };

  const sendWhatsApp = () => {
    const typeLabel = PRINT_TYPES.find(m => m.id === formData.printType)?.label;
    const colorLabels = formData.colors.map(id => COLORS.find(c => c.id === id)?.label).join(', ');
    const materialLabel = MATERIALS.find(m => m.id === formData.material)?.label;
    const discountInfo = getDiscountInfo(formData.quantity);
    const text = `*COTIZACIÓN PERSONALIZADA NOVA3D*%0A` +
      `----------------------------------%0A` +
      `*Producto:* ${selectedProduct ? selectedProduct.name : typeLabel}%0A` +
      `*Material:* ${materialLabel}%0A` +
      `*Colores:* ${colorLabels}%0A` +
      `*Cantidad:* ${formData.quantity} unidades%0A` +
      `*Descuento:* ${discountInfo.label} (${(discountInfo.discount * 100).toFixed(0)}% OFF)%0A` +
      `*Estado:* ${formData.isDesigned ? 'Diseño provisto' : 'Necesita diseño/ajuste'}%0A` +
      `*Tamaño Final:* ${formData.width}x${formData.height}x${formData.depth}cm%0A` +
      `----------------------------------%0A` +
      `*Archivo:* ${selectedFile ? selectedFile.name : (selectedProduct ? 'Producto de catálogo' : 'No adjunto')}%0A` +
      `*TOTAL ESTIMADO:* ARS $${estimate.toLocaleString()}%0A` +
      `----------------------------------%0A` +
      `Hola, me interesa encargar esta cantidad con este tamaño.`;
    
    window.open(`https://wa.me/5491169442108?text=${text}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto px-4 md:px-6 py-24 mb-20"
    >
      {/* Product Categories Selector */}
      <div className="mb-8">
        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 block">Seleccionar producto</label>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[140px] md:min-w-[170px] p-4 rounded-xl border-2 transition-all group shrink-0",
                selectedCategory === cat.id 
                  ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors",
                selectedCategory === cat.id ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-primary"
              )}>
                <cat.icon className="w-6 h-6" />
              </div>
              <span className={cn(
                "text-[11px] font-black uppercase tracking-wider text-center",
                selectedCategory === cat.id ? "text-primary" : "text-zinc-600 dark:text-zinc-400"
              )}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Configuration Area */}
        <div className="lg:col-span-9 space-y-6">
          <div className={cn(
            "p-8 rounded-3xl border transition-all relative overflow-hidden",
            theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200"
          )}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <Box className="w-5 h-5 text-primary" />
                Cotización de impresión 3D en línea
              </h3>
              <div className="flex items-center gap-6">
                <button className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Guía de impresión 3D {'>'}
                </button>
                <div className="relative">
                  <button className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary flex items-center gap-2">
                    <History className="w-4 h-4" /> Historial de subidas <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "mb-8 p-12 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all group hover:border-primary/50 cursor-pointer relative overflow-hidden",
                theme === 'dark' ? "border-white/5 bg-zinc-950/50" : "border-zinc-200 bg-zinc-50"
              )}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
                <Upload className="w-5 h-5" /> Agregar archivos 3D
              </button>
              <div className="text-center">
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest mb-2">
                  Tipos de archivo: STL, STP, STEP, OBJ, 3MF. Espesor de pared {'>'} 1,2 mm, parte más delgada ≥ 0,8 mm.{" "}
                  <span className="text-primary cursor-pointer hover:underline">Instrucciones de carga.</span>
                </p>
                <p className="text-[9px] text-zinc-400 font-medium flex items-center justify-center gap-2">
                   <Package className="w-3 h-3" /> Todas las cargas son seguras y confidenciales.
                </p>
              </div>
              <AnimatePresence>
                {selectedFile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-4 right-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3"
                  >
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary truncate max-w-[200px]">{selectedFile.name}</span>
                    <button onClick={removeFile} className="p-1 hover:bg-primary/20 rounded-lg transition-all"><X className="w-3 h-3 text-primary" /></button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl mb-10 flex items-start gap-4">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
                La carga de armas o piezas que contengan artículos sujetos a control de exportación, lo cual infringe nuestros <span className="text-primary hover:underline cursor-pointer">términos de uso</span>, conllevará la desactivación de la cuenta.
              </p>
            </div>

            {/* Config Sections */}
            <div className="space-y-12">
              {/* Print Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-6">
                <div className="md:col-span-3 flex flex-col pt-2">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Tipo de impresión</span>
                </div>
                <div className="md:col-span-9 flex flex-wrap gap-2">
                  {PRINT_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({...formData, printType: type.id})}
                      className={cn(
                        "px-6 py-3 rounded-lg border-2 text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
                        formData.printType === type.id 
                          ? "bg-primary text-white border-primary shadow-lg" 
                          : "bg-transparent border-zinc-200 dark:border-white/5 text-zinc-500 hover:border-primary/50"
                      )}
                    >
                      {type.label}
                      {formData.printType === type.id && <div className="absolute top-0 right-0 w-3 h-3 bg-white translate-x-1.5 -translate-y-1.5 rotate-45" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Selection */}
              <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-6">
                <div className="md:col-span-3 flex flex-col pt-2">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Material</span>
                </div>
                <div className="md:col-span-9 flex flex-wrap gap-2">
                  {MATERIALS.map(mat => (
                    <button
                      key={mat.id}
                      onClick={() => setFormData({...formData, material: mat.id})}
                      className={cn(
                        "px-6 py-3 rounded-lg border-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
                        formData.material === mat.id 
                          ? "bg-primary text-white border-primary shadow-lg" 
                          : "bg-transparent border-zinc-200 dark:border-white/5 text-zinc-500 hover:border-primary/50"
                      )}
                    >
                      {mat.recommended && <div className="absolute -top-1.5 -left-1.5"><MousePointer2 className="w-4 h-4 text-primary fill-primary -rotate-45" /></div>}
                      {mat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-6">
                <div className="md:col-span-3 pt-2">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Color</span>
                </div>
                <div className="md:col-span-9 flex flex-wrap gap-4">
                  {COLORS.map(color => {
                    const isSelected = formData.colors.includes(color.id);
                    return (
                      <button
                        key={color.id}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({ ...formData, colors: formData.colors.filter(id => id !== color.id) });
                          } else {
                            const newColors = [...formData.colors, color.id];
                            if (newColors.length > 4) newColors.shift();
                            setFormData({ ...formData, colors: newColors });
                          }
                        }}
                        className="group flex flex-col items-center gap-2"
                        title={color.label}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all p-0.5 relative flex items-center justify-center",
                          isSelected 
                            ? "border-primary shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-110" 
                            : "border-zinc-200 dark:border-white/5 hover:border-primary/40"
                        )}>
                          <div 
                            className="w-full h-full rounded-full border border-black/10 dark:border-white/20 shadow-inner" 
                            style={{ 
                              background: color.value === 'transparent' 
                                ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' 
                                : color.value,
                              backgroundSize: color.value === 'transparent' ? '8px 8px' : undefined,
                              backgroundPosition: color.value === 'transparent' ? '0 0, 4px 4px' : undefined
                            }} 
                          />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <CheckCircle2 className={cn(
                                "w-5 h-5 drop-shadow-md", 
                                (color.id === 'WHITE' || color.id === 'YELLOW' || color.id === 'SILVER' || color.id === 'CLEAR') ? "text-black" : "text-white"
                              )} />
                            </div>
                          )}
                        </div>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest transition-colors",
                          isSelected ? "text-primary" : "text-zinc-500 group-hover:text-zinc-400"
                        )}>
                          {color.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Surface Finish Selection */}
              <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-6">
                <div className="md:col-span-3 flex items-center gap-2 pt-2">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Acabado superficial</span>
                  <HelpCircle className="w-3 h-3 text-zinc-400 cursor-help" />
                </div>
                <div className="md:col-span-9 space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {SURFACE_FINISHES.map(finish => (
                      <button
                        key={finish.id}
                        onClick={() => setFormData({...formData, hasSurfaceFinish: finish.id})}
                        className={cn(
                          "px-10 py-3 rounded-lg border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                          formData.hasSurfaceFinish === finish.id 
                            ? "bg-primary text-white border-primary shadow-lg" 
                            : "bg-transparent border-zinc-200 dark:border-white/5 text-zinc-500 hover:border-primary/50"
                        )}
                      >
                        {finish.label}
                      </button>
                    ))}
                  </div>
                  
                  {formData.hasSurfaceFinish === 'YES' && (
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                       <div className="relative w-full md:w-48">
                         <select 
                           value={formData.finishType}
                           onChange={(e) => setFormData({...formData, finishType: e.target.value})}
                           className={cn(
                             "w-full p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest bg-transparent outline-none appearance-none cursor-pointer",
                             theme === 'dark' ? "border-white/10" : "border-zinc-200"
                           )}
                         >
                           {SANDING_OPTIONS.map(opt => (
                             <option key={opt.id} value={opt.id} className="bg-zinc-900">{opt.label}</option>
                           ))}
                         </select>
                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                       </div>
                       <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                         <CheckCircle2 className="w-3 h-3 text-primary" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-primary">Lijado general</span>
                       </div>
                       <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors flex items-center gap-1">
                         + Agregar
                       </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                <div className="md:col-span-3">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Cantidad</span>
                </div>
                <div className="md:col-span-9">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input 
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: Math.max(1, parseInt(e.target.value) || 1)})}
                        className={cn(
                          "w-32 p-3 pr-8 border-2 rounded-xl text-lg font-black bg-transparent outline-none transition-all",
                          theme === 'dark' ? "border-white/5 focus:border-primary/50 text-white" : "border-zinc-200 focus:border-primary"
                        )}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                        <button onClick={() => setFormData({...formData, quantity: formData.quantity + 1})} className="p-0.5 hover:text-primary transition-colors"><ChevronDown className="w-3 h-3 rotate-180" /></button>
                        <button onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})} className="p-0.5 hover:text-primary transition-colors"><ChevronDown className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Description / Type */}
              <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                <div className="md:col-span-3 flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Descripción del producto</span>
                  <HelpCircle className="w-3 h-3 text-zinc-400 cursor-help" />
                </div>
                <div className="md:col-span-9 relative">
                   <select 
                      className={cn(
                        "w-full md:w-80 p-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest bg-transparent outline-none appearance-none cursor-pointer",
                        theme === 'dark' ? "border-white/10" : "border-zinc-200"
                      )}
                   >
                     <option value="">Seleccionar</option>
                     <option value="FUNCIONAL">Repuesto funcional</option>
                     <option value="DECORATIVO">Objeto decorativo</option>
                   </select>
                   <ChevronDown className="absolute left-72 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none md:block hidden" />
                </div>
              </div>

               {/* Price Info */}
               <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 pt-4">
                <div className="md:col-span-3">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Precio</span>
                </div>
                <div className="md:col-span-9">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Desde</span>
                    <span className="text-3xl font-black text-[#f97316] italic tracking-tighter">$ {estimate.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-6 border-t border-zinc-200 dark:border-white/5 pt-10">
                <div className="md:col-span-3 flex items-center gap-2 pt-1">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Comentario 3D</span>
                  <Brush className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="md:col-span-9">
                  <textarea 
                    placeholder="Añadir notas o requerimientos técnicos..."
                    className={cn(
                      "w-full h-32 p-6 rounded-2xl border-2 bg-transparent outline-none text-xs font-medium resize-none transition-all",
                      theme === 'dark' ? "border-white/5 focus:border-primary/50" : "border-zinc-200 focus:border-primary"
                    )}
                  />
                  <div className="flex justify-end mt-4">
                     <button className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary flex items-center gap-2">
                        <History className="w-4 h-4" /> Borrar
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className={cn(
            "p-8 rounded-[40px] border shadow-2xl sticky top-32 transition-all",
            theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200"
          )}>
            <div className="mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Detalles del cargo</span>
            </div>

            <div className="mb-10 space-y-2">
              <div className="flex justify-between items-center">
                 <p className="text-sm font-black uppercase tracking-widest">Precio total</p>
                 <span className="text-xl font-black text-primary">--</span>
              </div>
              <p className="text-[9px] text-zinc-400 font-medium">
                Pueden aplicarse cargos adicionales en <span className="text-primary hover:underline cursor-pointer">casos especiales.</span>
              </p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-3">
                <div 
                  onClick={() => setFormData({...formData, acceptedTerms: !formData.acceptedTerms})}
                  className={cn(
                    "w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center cursor-pointer transition-all",
                    formData.acceptedTerms ? "bg-primary border-primary" : "border-zinc-300 dark:border-white/10"
                  )}
                >
                  {formData.acceptedTerms && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
                  Acepto <span className="text-primary hover:underline cursor-pointer">los términos de uso de JLC3DP.</span>
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={sendWhatsApp}
                  disabled={!formData.acceptedTerms}
                  className="w-full h-16 bg-primary text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" /> Enviar pedido
                </button>
                <button 
                  onClick={handleQuoteAddToCart}
                  disabled={!formData.acceptedTerms}
                  className="w-full h-16 bg-transparent border-2 border-primary text-primary font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" /> GUARDAR EN EL CARRITO
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-200 dark:border-white/5 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest">Estimación de envío</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                   Peso <HelpCircle className="w-3 h-3 cursor-help" />
                 </span>
                 <span className="text-xs font-black">--</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-white/5">
              <div className="flex justify-between items-center group cursor-pointer">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cupones</span>
                    <HelpCircle className="w-3 h-3 text-zinc-400" />
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-white/10 text-[9px] font-black text-zinc-400">Ahorre $300.00</div>
                    <ChevronDown className="w-4 h-4 text-zinc-400 -rotate-90 group-hover:text-primary transition-all" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
