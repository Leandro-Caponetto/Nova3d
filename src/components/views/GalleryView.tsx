import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, X, ChevronLeft, ChevronRight, TrendingDown, Info, 
  Percent, MessageCircle, Filter, Trash2, Palette, Maximize, 
  Settings, Ruler, Scale, SlidersHorizontal, ChevronDown, ChevronUp, Search, Heart
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Product } from '../../types';
import { WhatsAppProductModal } from '../common/WhatsAppProductModal';

const categoryColors: Record<string, string> = {
  MECH: 'text-blue-500 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
  INDUSTRIAL: 'text-amber-500 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
  DECOR: 'text-emerald-500 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
  COSPLAY: 'text-purple-500 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
  DEFAULT: 'text-primary border-primary/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
};

function getCategoryColor(category: string) {
  return categoryColors[category?.toUpperCase()] || categoryColors.DEFAULT;
}

// Discount Logic Helpers
const getPriceTier = (quantity: number, basePrice: number) => {
  if (quantity >= 1000) return basePrice * 0.50; // 50% OFF (Mega Wholesaler)
  if (quantity >= 500) return basePrice * 0.65;  // 35% OFF (Major Wholesaler)
  if (quantity >= 100) return basePrice * 0.75;  // 25% OFF (Wholesale)
  if (quantity >= 50) return basePrice * 0.85;   // 15% OFF (Local Business)
  if (quantity >= 10) return basePrice * 0.90;   // 10% OFF (Small Batch)
  return basePrice;
};

// Map of color names to hex codes for the swatches
const COLOR_MAP: Record<string, string> = {
  // English
  'red': '#ef4444',
  'blue': '#3b82f6',
  'green': '#22c55e',
  'black': '#000000',
  'white': '#ffffff',
  'gold': '#fbbf24',
  'silver': '#9ca3af',
  'bronze': '#b45309',
  'purple': '#a855f7',
  'pink': '#ec4899',
  'orange': '#f97316',
  'yellow': '#eab308',
  'cyan': '#06b6d4',
  'grey': '#71717a',
  'gray': '#71717a',
  'brown': '#78350f',
  'transparent': 'transparent',
  'lime': '#84cc16',
  'emerald': '#10b981',
  'teal': '#14b8a6',
  'indigo': '#6366f1',
  'violet': '#8b5cf6',
  'fuchsia': '#d946ef',
  'rose': '#f43f5e',
  // Spanish
  'rojo': '#ef4444',
  'azul': '#3b82f6',
  'verde': '#22c55e',
  'negro': '#000000',
  'blanco': '#ffffff',
  'oro': '#fbbf24',
  'dorado': '#fbbf24',
  'plata': '#9ca3af',
  'plateado': '#9ca3af',
  'bronce': '#b45309',
  'purpura': '#a855f7',
  'morado': '#a855f7',
  'rosa': '#ec4899',
  'rosado': '#ec4899',
  'naranja': '#f97316',
  'amarillo': '#eab308',
  'cian': '#06b6d4',
  'gris': '#71717a',
  'cafe': '#78350f',
  'marron': '#78350f',
  'violeta': '#7c3aed',
  'lima': '#84cc16',
  'esmeralda': '#10b981',
  'turquesa': '#14b8a6',
  'transparente': 'transparent',
};

const getSwatchColor = (color: string) => {
  if (!color) return '#71717a';
  const normalized = color.trim().toLowerCase();
  
  // Custom manual mappings for common variations
  if (normalized === 'todos' || normalized === 'all') return 'transparent';
  if (normalized.includes('rojo') || normalized.includes('red')) return '#ef4444';
  if (normalized.includes('azul') || normalized.includes('blue')) return '#3b82f6';
  if (normalized.includes('verde') || normalized.includes('green')) return '#22c55e';
  if (normalized.includes('negro') || normalized.includes('black')) return '#000000';
  if (normalized.includes('blanco') || normalized.includes('white')) return '#ffffff';
  if (normalized.includes('dorado') || normalized.includes('oro') || normalized.includes('gold')) return '#fbbf24';
  if (normalized.includes('plata') || normalized.includes('silver')) return '#9ca3af';
  if (normalized.includes('bronce') || normalized.includes('bronze')) return '#b45309';
  if (normalized.includes('naranja') || normalized.includes('orange')) return '#f97316';
  if (normalized.includes('amarillo') || normalized.includes('yellow')) return '#eab308';
  if (normalized.includes('rosa') || normalized.includes('pink')) return '#ec4899';
  if (normalized.includes('gris') || normalized.includes('grey') || normalized.includes('gray')) return '#71717a';
  
  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];
  if (color.startsWith('#')) return color;
  
  return '#71717a'; // Default fallback
};

const getDiscountLabel = (quantity: number) => {
  if (quantity >= 1000) return "50% OFF - MEGA_BULK";
  if (quantity >= 500) return "35% OFF - MAJOR_BULK";
  if (quantity >= 100) return "25% OFF - WHOLESALE";
  if (quantity >= 50) return "15% OFF - BUSINESS";
  if (quantity >= 10) return "10% OFF - BATCH";
  return null;
};

function ProductCard({ product, addToCart, onSelect, onWhatsApp, theme, user, isLiked, onToggleLike }: any) {
  const [currentImg, setCurrentImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiking, setIsLiking] = useState(false);
  const hasMultiple = product.images.length > 1;

  const currentPrice = getPriceTier(quantity, product.price);
  const discountLabel = getDiscountLabel(quantity);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // If no user, we could trigger a login modal. 
      // For now, let's just alert or let the parent handle it if props were added.
      // Since I can't easily add a new prop to the whole chain without more edits, 
      // I'll make it show but only work for registered users.
      return; 
    }
    setIsLiking(true);
    await onToggleLike(product.id, isLiked);
    setIsLiking(false);
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg(prev => (prev + 1) % product.images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg(prev => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn("group rounded-[32px] overflow-hidden border flex flex-col hover:border-primary/50 transition-all cursor-pointer shadow-xl relative h-full group/card",
        theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}
      onClick={() => onSelect(product)}
    >
      <div className="aspect-[4/5] bg-gradient-to-br from-zinc-800 to-black relative flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img 
            key={product.images[currentImg]}
            src={product.images[currentImg]} 
            alt={product.name} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        <div className={cn(
          "absolute top-4 left-4 z-10 bg-zinc-950/80 text-[8px] font-black px-3 py-1.5 rounded-lg backdrop-blur-md border uppercase tracking-[0.2em] shadow-lg flex items-center gap-2",
          getCategoryColor(product.category)
        )}>
          {product.category}
          <div className="w-[1px] h-3 bg-white/20 mx-1" />
          <span className="text-white">NOVA<span className="text-primary glow-text">3D</span></span>
        </div>

        {/* Promo Banner for Keychains */}
        {(product.name.toLowerCase().includes('llavero') || product.category.toLowerCase().includes('llavero') || product.id.includes('llavero') || product.name.toLowerCase().includes('pulpo') || product.name.toLowerCase().includes('harry potter')) && (
          <div className="absolute top-16 left-0 z-10 bg-red-600 px-4 py-2 rounded-r-xl border-y border-r border-white/30 shadow-[0_10px_20px_rgba(220,38,38,0.4)] animate-pulse">
            <div className="flex flex-col">
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white leading-none mb-1">PROMO MAYORISTA</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[11px] font-black uppercase tracking-tighter text-white leading-none">1000u</span>
                <span className="text-[9px] font-bold text-white/90">al</span>
                <span className="text-[13px] font-black italic text-white">50%</span>
                <span className="text-[8px] font-bold text-white/70">C/U</span>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 z-[20] flex flex-col gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onWhatsApp(product); }}
            className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-transform"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleToggleLike}
            disabled={isLiking}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50",
              isLiked 
                ? "bg-rose-500 text-white shadow-rose-500/30" 
                : "bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-white/40"
            )}
          >
            <Heart className={cn("w-4 h-4", isLiked ? "fill-current" : "")} />
          </button>
        </div>

        {hasMultiple && (
          <>
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              {product.images.map((_: any, idx: number) => (
                <div 
                  key={idx} 
                  className={cn("h-1 rounded-full transition-all duration-300", 
                    idx === currentImg ? "w-4 bg-primary" : "w-1 bg-white/40")}
                />
              ))}
            </div>
            
            <button 
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-primary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-primary"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-6">
          <span className={cn("text-base font-black group-hover:text-primary transition-colors uppercase italic tracking-tighter leading-none",
            theme === 'dark' ? "text-white" : "text-black")}>{product.name}</span>
        </div>

        {/* Quantity Selector Mini */}
        <div className="flex flex-col gap-3 mt-auto">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-zinc-500/10 mb-2">
            <label className="text-[8px] font-black text-primary uppercase tracking-[0.2em] pl-2 drop-shadow-sm">CANT_SYS</label>
            <input 
              type="number" 
              min="1" 
              max="2000" 
              value={quantity} 
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                const val = parseInt(e.target.value);
                setQuantity(isNaN(val) ? 1 : Math.min(2000, Math.max(1, val)));
              }}
              className="w-16 bg-transparent text-[11px] font-black text-right focus:outline-none text-primary"
            />
          </div>

          <div className="flex justify-between items-center py-4 border-t border-zinc-500/10">
            <div className="flex flex-col">
              {discountLabel && (
                <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-[0.15em] italic mb-0.5">
                  {discountLabel.split(' - ')[0]} ACTIVE
                </span>
              )}
              <span className="text-primary font-black italic font-mono text-xl tracking-tighter glow-text">
                ${currentPrice.toLocaleString()}
                <span className="text-[9px] lowercase font-medium text-zinc-500 ml-1">/u</span>
              </span>
              {quantity > 1 && (
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
                  TOTAL: ${(currentPrice * quantity).toLocaleString()}
                </span>
              )}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); addToCart(product, quantity); }}
              className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                theme === 'dark' ? "bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white" : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-primary hover:text-white")}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FilterSection({ title, children, theme }: { title: string, children: React.ReactNode, theme: string }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-zinc-500/10 py-5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-primary transition-all group/title"
      >
        <span className="flex items-center gap-2">
          <div className={cn("w-1 h-3 rounded-full bg-primary/20 group-hover/title:bg-primary transition-colors", isOpen ? "bg-primary" : "")} />
          {title}
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 py-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GalleryView({ products, addToCart, t, theme, onWhatsApp, searchQuery, setSearchQuery, user }: any) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [currentDetailImg, setCurrentDetailImg] = useState(0);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    color: 'all',
    size: 'all',
    material: 'all',
    priceRange: [0, 50000],
    onlyOnSale: false,
    minRating: 0
  });

  const fetchUserLikes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('product_likes')
      .select('product_id')
      .eq('user_id', user.id);
    
    if (!error && data) {
      setUserLikes(data.map(d => d.product_id));
    }
  };

  React.useEffect(() => {
    fetchUserLikes();
  }, [user]);

  const toggleLike = async (productId: string, isLiked: boolean) => {
    if (!user) return;
    
    if (isLiked) {
      const { error } = await supabase
        .from('product_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (!error) {
        setUserLikes(prev => prev.filter(id => id !== productId));
      }
    } else {
      const { error } = await supabase
        .from('product_likes')
        .insert({
          user_id: user.id,
          product_id: productId
        });
      
      if (!error) {
        setUserLikes(prev => [...prev, productId]);
      }
    }
  };

  const itemsPerPage = 9;

  const filterOptions = useMemo(() => {
    const cats = ['all', ...Array.from(new Set(products.map((p: any) => p.category))) as string[]];
    const colors = ['all', ...Array.from(new Set(products.flatMap((p: any) => p.colors || []))) as string[]];
    const sizes = ['all', ...Array.from(new Set(products.flatMap((p: any) => p.sizes || []))) as string[]];
    const materials = ['all', ...Array.from(new Set(products.map((p: any) => p.material).filter(Boolean))) as string[]];
    
    // Add some default values if nothing exists to show the user how it looks
    if (colors.length === 1) colors.push('Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Dorado', 'Plata', 'Bronce');
    if (sizes.length === 1) sizes.push('Mini', 'Normal', 'Coleccionista', 'Escala 1:1');
    if (materials.length === 1) materials.push('PLA+', 'PETG', 'ABS', 'Resina (8K)', 'Flexible');

    return { cats, colors, sizes, materials };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      const matchesSearch = !searchQuery || [p.name, p.category, p.description].some(field => 
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchesCategory = activeFilters.category === 'all' || p.category === activeFilters.category;
      
      const matchesColor = activeFilters.color === 'all' || (p.colors && p.colors.includes(activeFilters.color));
      
      const matchesSize = activeFilters.size === 'all' || (p.sizes && p.sizes.includes(activeFilters.size));
      
      const matchesMaterial = activeFilters.material === 'all' || p.material === activeFilters.material;
      
      const matchesPrice = p.price >= activeFilters.priceRange[0] && p.price <= activeFilters.priceRange[1];

      const matchesSale = !activeFilters.onlyOnSale || (p.pricePerGram !== undefined || p.pricePerHour !== undefined); 
      // Assuming products with these fields are special/custom or have different pricing
      // Better yet, let's just check rating if it exists
      const matchesRating = p.rating ? p.rating >= activeFilters.minRating : activeFilters.minRating === 0;

      return matchesSearch && matchesCategory && matchesColor && matchesSize && matchesMaterial && matchesPrice && matchesSale && matchesRating;
    });
  }, [products, searchQuery, activeFilters]);

  const currentDetailPrice = selected ? getPriceTier(detailQuantity, selected.price) : 0;
  const detailDiscount = selected ? getDiscountLabel(detailQuantity) : null;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filteredProducts.length, activeFilters]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const resetFilters = () => {
    setActiveFilters({
      category: 'all',
      color: 'all',
      size: 'all',
      material: 'all',
      priceRange: [0, 50000],
      onlyOnSale: false,
      minRating: 0
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 py-12"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">{t.catalogHeader}</h3>
            <div className="h-1 w-20 bg-primary shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn("hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-lg hover:-translate-y-0.5 active:scale-95",
                showFilters 
                  ? "bg-primary border-primary text-white shadow-primary/30 shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                  : "bg-zinc-500/5 border-zinc-500/20 text-zinc-500 hover:border-primary/40")}
            >
              <SlidersHorizontal className={cn("w-4 h-4 mr-1", showFilters ? "animate-pulse" : "")} />
              {showFilters ? "HIDE_FILTERS" : "SHOW_FILTERS"}
            </button>

            <div className={cn("flex flex-grow md:flex-grow-0 relative items-center group min-w-[200px]", 
              theme === 'dark' ? "text-zinc-400" : "text-zinc-500")}>
              <Search className="absolute left-4 w-4 h-4 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder={t.searchPlaceholder || "Buscar pieza..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-11 pr-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  theme === 'dark' 
                    ? "bg-zinc-900 border-white/5 focus:border-primary/50 text-white" 
                    : "bg-white border-zinc-200 focus:border-primary/50 text-black"
                )}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 hover:bg-zinc-500/10 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-4">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className={cn("w-10 h-10 rounded-xl border flex items-center justify-center transition-all disabled:opacity-20",
                theme === 'dark' ? "border-white/10 hover:bg-primary hover:text-white" : "border-zinc-200 hover:bg-primary hover:text-white")}
            >
              ‹
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">P_ {currentPage} / {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className={cn("w-10 h-10 rounded-xl border flex items-center justify-center transition-all disabled:opacity-20",
                theme === 'dark' ? "border-white/10 hover:bg-primary hover:text-white" : "border-zinc-200 hover:bg-primary hover:text-white")}
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ x: -20, opacity: 0, height: 0 }}
              animate={{ x: 0, opacity: 1, height: "auto" }}
              exit={{ x: -20, opacity: 0, height: 0 }}
              className="hidden md:block w-full md:w-[300px] flex-shrink-0"
            >
              <div className={cn("sticky top-24 rounded-[32px] border p-8 space-y-2",
                theme === 'dark' ? "bg-zinc-900/50 border-white/5" : "bg-white border-zinc-200")}>
                <div className="flex items-center justify-between mb-6">
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                    <Filter className="w-4 h-4" /> {t.filters}
                  </span>
                  <button 
                    onClick={resetFilters}
                    className="p-2 hover:bg-primary/10 rounded-lg text-zinc-500 hover:text-primary transition-colors"
                    title={t.filterReset}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <FilterSection title="FAST_FILTERS" theme={theme}>
                  <button 
                    onClick={() => setActiveFilters(prev => ({ ...prev, onlyOnSale: !prev.onlyOnSale }))}
                    className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                      activeFilters.onlyOnSale 
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                        : "bg-zinc-500/5 border-zinc-500/10 text-zinc-500 hover:border-primary/30")}
                  >
                    <Percent className="w-3 h-3" />
                    DISCOUNTED
                  </button>
                  <button 
                    onClick={() => setActiveFilters(prev => ({ ...prev, minRating: prev.minRating === 4 ? 0 : 4 }))}
                    className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                      activeFilters.minRating === 4 
                        ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" 
                        : "bg-zinc-500/5 border-zinc-500/10 text-zinc-500 hover:border-primary/30")}
                  >
                    ★ 4.0+ RATING
                  </button>
                </FilterSection>

                <FilterSection title={t.filterCategory} theme={theme}>
                  {filterOptions.cats.map((cat: string) => (
                    <button 
                      key={cat}
                      onClick={() => setActiveFilters(prev => ({ ...prev, category: cat }))}
                      className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                        activeFilters.category === cat 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-zinc-500/5 border-zinc-500/10 text-zinc-500 hover:border-primary/30")}
                    >
                      {cat === 'all' ? t.all : cat}
                    </button>
                  ))}
                </FilterSection>



                <FilterSection title={t.filterSize} theme={theme}>
                  {filterOptions.sizes.map((size: string) => (
                    <button 
                      key={size}
                      onClick={() => setActiveFilters(prev => ({ ...prev, size: size }))}
                      className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                        activeFilters.size === size 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-zinc-500/5 border-zinc-500/10 text-zinc-500 hover:border-primary/30")}
                    >
                      <Maximize className="w-3 h-3" />
                      {size === 'all' ? t.all : size}
                    </button>
                  ))}
                </FilterSection>

                <FilterSection title={t.filterMaterial} theme={theme}>
                  {filterOptions.materials.map((mat: string) => (
                    <button 
                      key={mat}
                      onClick={() => setActiveFilters(prev => ({ ...prev, material: mat }))}
                      className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                        activeFilters.material === mat 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-zinc-500/5 border-zinc-500/10 text-zinc-500 hover:border-primary/30")}
                    >
                      <Settings className="w-3 h-3" />
                      {mat === 'all' ? t.all : mat}
                    </button>
                  ))}
                </FilterSection>

                <FilterSection title={t.filterPrice} theme={theme}>
                  <div className="w-full space-y-4 px-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="100000" 
                      step="1000"
                      value={activeFilters.priceRange[1]}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, priceRange: [0, parseInt(e.target.value)] }))}
                      className="w-full h-1.5 bg-zinc-500/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between items-center text-[10px] font-mono font-black text-primary italic">
                      <span>$0</span>
                      <span className="bg-primary/10 px-2 py-1 rounded bg-blur">UP_TO_ ${activeFilters.priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </FilterSection>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {currentProducts.length > 0 ? currentProducts.map((product: Product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  addToCart={addToCart} 
                  onSelect={setSelected} 
                  onWhatsApp={onWhatsApp}
                  theme={theme} 
                  user={user}
                  isLiked={userLikes.includes(product.id)}
                  onToggleLike={toggleLike}
                />
              )) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-32 text-center text-zinc-500 font-black uppercase tracking-widest italic"
                >
                  <div className="space-y-4">
                    <p>{t.noProductsFound}</p>
                    {searchQuery && <p className="text-primary text-xs tracking-normal">"{searchQuery}"</p>}
                    <button 
                      onClick={resetFilters}
                      className="text-[10px] text-primary border-b border-primary/30 pb-1 hover:border-primary transition-all"
                    >
                      CLEAR_ALL_FILTERS
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black backdrop-blur-sm"
              onClick={() => setSelected(null)}
            >
              <div 
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{ 
                  backgroundImage: "url('https://i.makeagif.com/media/7-10-2020/hI7wZz.gif')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-0 bg-black/40" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn("border w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden relative shadow-3xl flex flex-col md:block",
                theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-gray-200")}
            >
              <button 
                onClick={() => { setSelected(null); setCurrentDetailImg(0); }}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-black/40 rounded-full hover:bg-white/10 z-[70] transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
              
              <div className="flex flex-col md:flex-row h-full overflow-y-auto md:overflow-visible">
                <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-full relative overflow-hidden group/modal shrink-0">

                  {/* Watermark */}
                  <div className="absolute top-8 left-8 z-10 px-3 py-1.5 bg-black/60 backdrop-blur-lg rounded-xl border border-white/10 pointer-events-none">
                    <span className="text-[10px] font-black tracking-tighter uppercase text-white">
                      NOVA<span className="text-primary glow-text">3D</span>
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={selected.images[currentDetailImg]}
                      src={selected.images[currentDetailImg]} 
                      className="w-full h-full object-cover opacity-90" 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      referrerPolicy="no-referrer" 
                    />
                  </AnimatePresence>
                  
                  {selected.images.length > 1 && (
                    <>
                      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2 z-10">
                        {selected.images.map((_: any, idx: number) => (
                          <button 
                            key={idx} 
                            onClick={() => setCurrentDetailImg(idx)}
                            className={cn("h-1.5 rounded-full transition-all duration-300", 
                              idx === currentDetailImg ? "w-6 bg-primary" : "w-1.5 bg-white/40")}
                          />
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => setCurrentDetailImg(prev => (prev - 1 + selected.images.length) % selected.images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/modal:opacity-100 transition-all hover:bg-primary"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => setCurrentDetailImg(prev => (prev + 1) % selected.images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/modal:opacity-100 transition-all hover:bg-primary"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col">
                  <span className={cn(
                    "font-black font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] mb-4 md:mb-8 inline-block px-3 py-1 md:px-4 md:py-1.5 bg-black/40 rounded-lg border backdrop-blur-md w-fit shadow-lg",
                    getCategoryColor(selected.category)
                  )}>
                    {selected.category}
                  </span>
                  <div className="flex items-center justify-between gap-4 mb-4 md:mb-6">
                    <h2 className={cn("text-3xl md:text-5xl font-light tracking-tighter uppercase italic drop-shadow-sm leading-none", theme === 'dark' ? "text-white" : "text-black")}>
                      {selected.name}
                    </h2>
                    <button 
                      onClick={() => onWhatsApp(selected)}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-transform shrink-0"
                    >
                      <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>
                  <p className={cn("mb-6 md:mb-8 leading-relaxed text-[11px] md:text-xs tracking-wide font-medium", theme === 'dark' ? "text-zinc-500" : "text-zinc-600")}>
                    {selected.description}
                  </p>


                  <div className="bg-black/20 rounded-2xl p-4 md:p-6 border border-white/5 mb-6 md:mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <TrendingDown className="w-3 h-3" /> TIERED_PRICING
                      </span>
                      <Info className="w-3 h-3 text-zinc-700" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className={cn("text-[8px] md:text-[9px] font-black tracking-widest", (detailQuantity >= 10 && detailQuantity < 50) ? "text-primary" : "text-zinc-600")}>+10 unidades: 10% OFF</p>
                        <p className={cn("text-[8px] md:text-[9px] font-black tracking-widest", (detailQuantity >= 100 && detailQuantity < 500) ? "text-primary" : "text-zinc-600")}>+100 unidades: 25% OFF</p>
                        <p className={cn("text-[8px] md:text-[9px] font-black tracking-widest", (detailQuantity >= 500 && detailQuantity < 1000) ? "text-primary" : "text-zinc-600")}>+500 unidades: 35% OFF</p>
                        <p className={cn("text-[8px] md:text-[9px] font-black tracking-widest", detailQuantity >= 1000 ? "text-primary" : "text-zinc-600")}>+1000 unidades: 50% OFF</p>
                      </div>
                      <div className="flex flex-col items-end justify-center sm:border-l border-white/5 sm:pl-4">
                        <label className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">ORDEN_INPUT</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="2000" 
                          value={detailQuantity} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setDetailQuantity(isNaN(val) ? 1 : Math.min(2000, Math.max(1, val)));
                          }}
                          className="w-full bg-black/40 border border-primary/30 rounded-lg p-2 text-primary font-mono font-black text-right text-base md:text-lg focus:ring-2 focus:ring-primary/20 highlight-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6 md:pt-8 border-t border-zinc-500/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col w-full sm:w-auto">
                      {detailDiscount && (
                         <motion.div 
                           initial={{ opacity: 0, y: 5 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="flex items-center gap-1.5 mb-1 opacity-80"
                         >
                           <Percent className="w-2.5 h-2.5 text-emerald-500" />
                           <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 italic">
                             {detailDiscount.split(' - ')[0]} PROMO
                           </span>
                         </motion.div>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-primary">${currentDetailPrice.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] md:text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">
                        SUBTOTAL: ${(currentDetailPrice * detailQuantity).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <button 
                        onClick={() => { addToCart(selected, detailQuantity); setSelected(null); setCurrentDetailImg(0); setDetailQuantity(1); }}
                        className="bg-primary text-white w-full sm:w-auto px-6 md:px-8 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-primary-dark transition-all shadow-[0_15px_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-4 hover:-translate-y-1 group"
                      >
                        <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" /> {t.detailAdd}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
