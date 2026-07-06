import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Truck, ChevronRight, Star, Heart, Share2, 
  Shield, CreditCard, Sparkles, MessageSquare, Plus, Minus, X, Check,
  Store, AlertCircle, ShoppingBag, Eye, RefreshCw, Handshake, Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Product } from '../../types';
import { ProductTrackingView } from './ProductTrackingView';

interface MercadoLibreShopViewProps {
  products: Product[];
  addToCart: (product: Product, quantity: number) => void;
  theme: 'dark' | 'light';
  t: any;
  user: any;
  profileAddress?: string;
  profilePostalCode?: string;
  profileFullName?: string;
  profilePhone?: string;
  onUpdateProfile?: (data: { address?: string; postalCode?: string; fullName?: string; phone?: string }) => void;
}

const unpackMetadata = (fullDesc: string) => {
  const match = fullDesc?.match(/\[ML_METADATA:(.*)\]$/);
  if (match) {
    try {
      const meta = JSON.parse(match[1]);
      const desc = fullDesc.replace(/\n\n\[ML_METADATA:.*\]$/, '');
      return { 
        desc, 
        mpLink: meta.mpLink || '', 
        disc: meta.disc !== undefined ? meta.disc : 10, 
        freeShip: meta.freeShip !== undefined ? !!meta.freeShip : true 
      };
    } catch (e) {
      // Ignore
    }
  }
  return { desc: fullDesc || '', mpLink: '', disc: 10, freeShip: true };
};

export function MercadoLibreShopView({ 
  products, 
  addToCart, 
  theme, 
  t, 
  user,
  profileAddress = 'Calle Falsa 123, Palermo, Capital Federal',
  profilePostalCode = '1425',
  profileFullName = '',
  profilePhone = '+54 9 11 5555-1234',
  onUpdateProfile
}: MercadoLibreShopViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [postalCode, setPostalCode] = useState(profilePostalCode);
  const [isEditingPostal, setIsEditingPostal] = useState(false);
  const [editName, setEditName] = useState(profileFullName);
  const [editAddress, setEditAddress] = useState(profileAddress);
  const [editPhone, setEditPhone] = useState(profilePhone);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubSection, setActiveSubSection] = useState<'store' | 'tracking'>('store');
  const [checkoutEmail, setCheckoutEmail] = useState(user?.email || '');
  const [checkoutAddress, setCheckoutAddress] = useState(profileAddress);

  // Sync state if props change
  React.useEffect(() => {
    if (profilePostalCode) setPostalCode(profilePostalCode);
  }, [profilePostalCode]);

  React.useEffect(() => {
    if (profileAddress) {
      setCheckoutAddress(profileAddress);
      setEditAddress(profileAddress);
    }
  }, [profileAddress]);

  React.useEffect(() => {
    if (profileFullName) setEditName(profileFullName);
  }, [profileFullName]);

  React.useEffect(() => {
    if (profilePhone) setEditPhone(profilePhone);
  }, [profilePhone]);

  // Sync edits when modal opens
  React.useEffect(() => {
    if (isEditingPostal) {
      setEditName(profileFullName);
      setEditAddress(profileAddress);
      setEditPhone(profilePhone);
    }
  }, [isEditingPostal, profileFullName, profileAddress, profilePhone]);
  
  // Favorites & Share States
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ml_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      try {
        localStorage.setItem('ml_favorites', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const handleCopyLink = (productId: string) => {
    const url = `${window.location.origin}?product=${productId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Image Hover Zoom states
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setZoomPos({ x: clampedX, y: clampedY });
  };
  
  const selectedProductMeta = useMemo(() => {
    if (!selectedProduct) return null;
    return unpackMetadata(selectedProduct.description);
  }, [selectedProduct]);
  
  // Mercado Pago states
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [showMpModal, setShowMpModal] = useState(false);
  const [simulatedPaymentSuccess, setSimulatedPaymentSuccess] = useState(false);
  
  const [customAlert, setCustomAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    submessage?: string;
    iconType: 'success' | 'info' | 'error';
    productImage?: string;
  }>({
    show: false,
    title: '',
    message: '',
    submessage: '',
    iconType: 'success'
  });
  
  // Custom mock questions for the item detail page
  const [questions, setQuestions] = useState<Array<{ q: string; a?: string; date: string }>>([
    { q: '¿Se puede hacer en otros colores como plateado seda?', a: '¡Hola! Sí, por supuesto. Contamos con filamento plateado seda de alta densidad que le da un acabado metálico espectacular. Podés detallarlo en la compra.', date: 'Hace 2 horas' },
    { q: '¿Qué resistencia mecánica tiene este material?', a: 'Trabajamos con PLA+ premium importado y PETG para alta resistencia mecánica, ideales para prototipos funcionales y soporte de cargas.', date: 'Ayer' }
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  // Postal code locations mapper
  const locationText = useMemo(() => {
    return profileAddress || 'Palermo, Capital Federal';
  }, [profileAddress]);

  // Categories mapper
  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  // Handle redirect from real Mercado Pago payment success
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment_status');
    if (paymentStatus === 'success') {
      // Clear URL params without reloading page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Trigger success payment logic
      const processRedirectSuccess = async () => {
        try {
          const savedData = localStorage.getItem('ml_pending_purchase');
          if (savedData) {
            const { product, quantity, payerEmail, locationText } = JSON.parse(savedData);
            
            // Set local states so the UI can display them and focus on them
            setSelectedProduct(product);
            setQuantity(quantity);
            setCheckoutEmail(payerEmail);
            setCheckoutAddress(locationText);
            setShowMpModal(true);
            setSimulatedPaymentSuccess(true);
            
            // Call backend API to trigger emails to customer and admin
            const response = await fetch('/api/mercadopago/success-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                product,
                quantity,
                totalAmount: product.price * quantity,
                payerEmail,
                locationText
              })
            });
            const data = await response.json();
            if (data.success) {
              console.log("Invoice email sent on redirect success", data);
            }
            
            // Clear pending purchase
            localStorage.removeItem('ml_pending_purchase');
          }
        } catch (e) {
          console.error("Error processing redirect success:", e);
        }
      };
      processRedirectSuccess();
    }
  }, [products]);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const qText = newQuestion;
    setQuestions(prev => [
      { q: qText, date: 'Hace unos instantes' },
      ...prev
    ]);
    setNewQuestion('');
    
    // Simulate smart seller answer after 2.5 seconds
    setTimeout(() => {
      setQuestions(prev => prev.map(item => {
        if (item.q === qText) {
          return {
            ...item,
            a: '¡Hola! Sí, realizamos envíos en el día mediante Mercado Envíos Flex y personalizamos tamaños a pedido. Cualquier otra duda, consultanos.',
          };
        }
        return item;
      }));
    }, 2000);
  };

  // Generate Mercado Pago Preference Link via backend API
  const handleMpCheckout = async (product: Product, qty: number) => {
    setCheckoutLoading(true);
    setShowMpModal(true);
    setSimulatedPaymentSuccess(false);
    
    const initialEmail = user?.email || checkoutEmail || 'comprador-test@example.com';
    const initialAddress = checkoutAddress || `Calle Falsa 123, ${locationText}`;
    setCheckoutEmail(initialEmail);
    setCheckoutAddress(initialAddress);
    
    try {
      const meta = unpackMetadata(product.description);
      if (meta.mpLink) {
        setCheckoutUrl(meta.mpLink);
        setCheckoutLoading(false);
        return;
      }

      const response = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [{
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: qty,
            images: product.images
          }],
          payerEmail: initialEmail
        })
      });

      const data = await response.json();
      if (data.init_point) {
        setCheckoutUrl(data.init_point);
        // Save pending purchase details for redirection success
        try {
          localStorage.setItem('ml_pending_purchase', JSON.stringify({
            product: { id: product.id, name: product.name, price: product.price, images: product.images },
            quantity: qty,
            payerEmail: initialEmail,
            locationText: initialAddress
          }));
        } catch (e) {
          console.error("Failed to save pending purchase", e);
        }
      } else {
        setCustomAlert({
          show: true,
          title: 'Error de Conexión',
          message: data.error || 'Error al conectar con Mercado Pago. Intente nuevamente.',
          iconType: 'error'
        });
      }
    } catch (err: any) {
      console.error(err);
      setCustomAlert({
        show: true,
        title: 'Error de Pasarela',
        message: 'No pudimos iniciar la pasarela de pago. Revise su conexión o intente más tarde.',
        iconType: 'error'
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const simulateSuccess = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/mercadopago/success-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product: selectedProduct,
          quantity: quantity,
          totalAmount: (selectedProduct?.price || 0) * quantity,
          payerEmail: checkoutEmail || user?.email || 'caponettopeppers@gmail.com',
          locationText: checkoutAddress || `Calle Falsa 123, ${locationText}`
        })
      });
      const data = await response.json();
      if (data.success) {
        console.log("Invoice email triggered successfully", data);
      }
    } catch (err) {
      console.error("Error triggering invoice email", err);
    } finally {
      setCheckoutLoading(false);
      setSimulatedPaymentSuccess(true);
    }
  };

  return (
    <div className="bg-[#f5f5f5] text-[#333333] min-h-screen font-sans pb-20 selection:bg-orange-500/20 selection:text-white">
      
      {/* 1. Premium Dark-Slate & Orange Banner Header */}
      <header className="bg-slate-900 border-b border-slate-800 shadow-md sticky top-[136px] z-40 text-white">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center gap-4 justify-between">
          
          {/* Logo & Search Area */}
          <div className="flex items-center gap-6 w-full md:w-auto flex-grow">
            {/* Custom ML-style hand-shake badge/branding in custom orange */}
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => { setSelectedProduct(null); setActiveCategory('all'); setSearchQuery(''); setActiveSubSection('store'); }}>
              <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center font-black italic text-white text-xs select-none shadow-md">
                ML<span className="text-white">3D</span>
              </div>
              <div className="hidden lg:flex flex-col leading-none">
                <span className="text-xs font-black tracking-tight text-white uppercase leading-none">mercado</span>
                <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase leading-none">libre 3d</span>
              </div>
            </div>

            {/* High-fidelity Search Input */}
            <div className="relative flex-grow max-w-2xl">
              <input 
                type="text"
                placeholder="Buscar productos, marcas y más..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveSubSection('store'); }}
                className="w-full bg-slate-800/90 text-sm text-white pl-4 pr-12 py-2.5 rounded-md border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-400 focus:border-transparent transition-all"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 p-1">
                <Search className="w-5 h-5 border-l border-slate-700 pl-1.5" />
              </button>
            </div>
          </div>

          {/* Prompt/Ad banner or Help label */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#00a650]/15 px-3 py-1 rounded text-[#00a650] text-[10px] font-black uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-bounce" /> Mercado Pago Activo
            </div>
          </div>
        </div>

        {/* Navigation Sub-header (Deliver to / Category Filter tags) */}
        <div className="bg-slate-950 border-t border-slate-800/40 py-2.5 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              
              {/* Deliver to postal code */}
              <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors bg-slate-900 sm:bg-transparent p-2 sm:p-0 rounded-xl border border-slate-800/80 sm:border-transparent" onClick={() => setIsEditingPostal(true)}>
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="flex flex-col leading-tight text-[11px]">
                  <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none mb-0.5">Enviar a</span>
                  <span className="font-bold text-slate-200">{locationText} ({postalCode})</span>
                </div>
              </div>

              {/* Categories */}
              <div className="hidden md:block h-4 w-[1px] bg-slate-800" />
              <div className="flex items-center gap-3 text-slate-400 font-normal overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => { setSelectedProduct(null); setActiveCategory(cat); setActiveSubSection('store'); }}
                    className={cn(
                      "hover:text-white transition-colors capitalize pb-0.5 whitespace-nowrap text-[11px] font-bold px-2 py-0.5 rounded",
                      activeCategory === cat ? "border-b border-orange-500 text-white" : ""
                    )}
                  >
                    {cat === 'all' ? 'Todas las Categorías' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 text-[11px] text-slate-400 border-t border-slate-900 pt-2 sm:pt-0 sm:border-t-0">
              <button 
                onClick={() => setActiveSubSection('store')}
                className={cn(
                  "hover:text-white cursor-pointer transition-colors font-bold",
                  activeSubSection === 'store' ? "text-orange-500 font-black" : "text-slate-400"
                )}
              >
                Tienda Catálogo
              </button>
              
              <button 
                onClick={() => setActiveSubSection('tracking')}
                className={cn(
                  "hover:text-white cursor-pointer transition-all font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 border",
                  activeSubSection === 'tracking' ? "text-blue-400 border-blue-500/30 bg-blue-500/10" : "text-slate-300 border-slate-800"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Seguimiento en Vivo
              </button>
              
              <span className="hover:text-white cursor-pointer transition-colors hidden lg:inline">Ofertas</span>
              <span className="hover:text-white cursor-pointer transition-colors hidden lg:inline">Ayuda</span>
            </div>
          </div>
        </div>
      </header>

      {/* User Profile / Shipping Address Editor Modal */}
      <AnimatePresence>
        {isEditingPostal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 max-w-md w-full border border-gray-100 dark:border-slate-800 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-orange-500/10 text-orange-500 p-2 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider text-gray-800 dark:text-gray-100">Datos de Envío y Cuenta</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Impacto en toda la App y Mapas</p>
                  </div>
                </div>
                <button onClick={() => setIsEditingPostal(false)} className="text-gray-400 hover:text-black dark:hover:text-white p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Full Name field */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 block">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all font-bold"
                  />
                </div>

                {/* Shipping Address field */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 block">Dirección de Entrega (Física)</label>
                  <input 
                    type="text" 
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Ej: Av. del Libertador 4500, Palermo, CABA"
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Postal Code field */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 block">Código Postal</label>
                    <input 
                      type="text" 
                      value={postalCode}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/\D/g, '').substring(0, 4);
                        setPostalCode(cleanVal);
                      }}
                      placeholder="Ej: 1425"
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all font-bold"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 block">Teléfono de Contacto</label>
                    <input 
                      type="text" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Ej: +54 9 11 5555-1234"
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-5 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditingPostal(false)}
                  className="px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-850 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (onUpdateProfile) {
                      onUpdateProfile({
                        fullName: editName,
                        address: editAddress,
                        postalCode: postalCode,
                        phone: editPhone
                      });
                    } else {
                      // Fallback if prop not provided
                      setCheckoutAddress(editAddress);
                    }
                    setIsEditingPostal(false);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-6 py-3 rounded-xl transition-all shadow-[0_10px_20px_rgba(249,115,22,0.15)] hover:shadow-[0_10px_25px_rgba(249,115,22,0.25)] flex items-center gap-1.5 cursor-pointer uppercase tracking-widest"
                >
                  <Check className="w-4 h-4" /> Guardar Datos
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        
        {/* Prominent Shipping / Account Data Banner */}
        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-orange-500 text-white p-2.5 rounded-xl shadow-md shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200">Dirección de Envío y Datos de la Cuenta</h4>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{profileAddress || "Calle Falsa 123, Palermo, Capital Federal"}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                <span>Destinatario: <strong className="text-gray-700 dark:text-gray-300 font-bold">{profileFullName || "Cliente Nova3D"}</strong></span>
                <span className="text-gray-300">•</span>
                <span>CP: <strong className="text-gray-700 dark:text-gray-300 font-bold">{profilePostalCode || postalCode}</strong></span>
                <span className="text-gray-300">•</span>
                <span>Tel: <strong className="text-gray-700 dark:text-gray-300 font-bold">{profilePhone || "+54 9 11 5555-1234"}</strong></span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsEditingPostal(true)}
            className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Settings className="w-4 h-4" /> Modificar Datos de Envío
          </button>
        </div>
        
        {/* Breadcrumb row (only in store sub-section) */}
        {activeSubSection === 'store' && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
            <span className="hover:underline cursor-pointer" onClick={() => setSelectedProduct(null)}>Tienda ML3D</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="capitalize">{activeCategory === 'all' ? 'Catálogo General' : activeCategory}</span>
            {selectedProduct && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="font-bold text-gray-700 truncate max-w-[200px]">{selectedProduct.name}</span>
              </>
            )}
          </div>
        )}

        {/* 2. MAIN SHOP GRID OR PRODUCT DETAILS VIEW */}
        <AnimatePresence mode="wait">
          {activeSubSection === 'tracking' ? (
            <motion.div
              key="tracking-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <ProductTrackingView 
                product={selectedProduct}
                quantity={quantity}
                locationText={locationText}
                postalCode={postalCode}
                theme={theme}
                onBackToStore={() => setActiveSubSection('store')}
                profileAddress={profileAddress}
                profilePostalCode={profilePostalCode}
                profileFullName={profileFullName}
                profilePhone={profilePhone}
                onUpdateProfile={onUpdateProfile}
              />
            </motion.div>
          ) : !selectedProduct ? (
            <motion.div 
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              {/* Left Filters Sidebar (ML Style) */}
              <div className="md:col-span-1 space-y-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold capitalize text-gray-900 leading-tight">
                    {activeCategory === 'all' ? 'Impresiones 3D' : activeCategory}
                  </h1>
                  <span className="text-xs text-gray-500">{filteredProducts.length} resultados</span>
                </div>

                {/* Shipping banner (ML Green Vibe) */}
                <div className="bg-white rounded-md p-4 border border-gray-200/80 shadow-sm flex items-start gap-3">
                  <div className="bg-[#00a650]/10 p-2 rounded-full text-[#00a650]">
                    <Truck className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#00a650] uppercase tracking-wide leading-none mb-1">Envío Gratis</h4>
                    <p className="text-[10px] text-gray-500 leading-normal">En todas las compras superiores a $30.000 de Nova3D.</p>
                  </div>
                </div>

                {/* Filter segments */}
                <div className="bg-white rounded-md p-5 border border-gray-200/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2">Condiciones de Envío</h3>
                  <div className="space-y-2 text-xs text-gray-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-400 w-4 h-4 border-gray-300" />
                      <span>Mercado Envíos Flex (En el día)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-400 w-4 h-4 border-gray-300" />
                      <span>Envío gratis nacional</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-md p-5 border border-gray-200/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2">Material de Fabricación</h3>
                  <div className="space-y-2 text-xs text-gray-600">
                    <button className="block text-blue-600 hover:underline text-left">PLA Premium de Alta Densidad (12)</button>
                    <button className="block text-blue-600 hover:underline text-left">Resina Alta Definición 8K (4)</button>
                    <button className="block text-blue-600 hover:underline text-left">PETG Reforzado (2)</button>
                    <button className="block text-blue-600 hover:underline text-left">Flexible / TPU (1)</button>
                  </div>
                </div>
              </div>

              {/* Right Products Feed Grid (High-fidelity ML Cards) */}
              <div className="md:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((p) => {
                    const meta = unpackMetadata(p.description);
                    const discountPercent = meta.disc;
                    const installmentsPrice = Math.round(p.price / 6);
                    
                    return (
                      <div 
                        key={p.id}
                        onClick={() => { setSelectedProduct(p); setCurrentImgIdx(0); setQuantity(1); }}
                        className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group relative"
                      >
                        {/* Image section */}
                        <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center p-4 border-b border-gray-100">
                          <img 
                            src={p.images[0]} 
                            alt={p.name} 
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          {p.is_featured && (
                            <div className="absolute top-2 left-2 bg-[#3483fa] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                              DESTACADO
                            </div>
                          )}
                        </div>

                        {/* Text information */}
                        <div className="p-4 flex flex-col flex-grow">
                          <p className="text-xs text-gray-500 font-medium mb-1 capitalize tracking-wide">{p.category} • Nova3D</p>
                          <h2 className="text-sm font-normal text-gray-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors mb-2">
                            {p.name}
                          </h2>

                          {/* Ratings stars */}
                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-400">(48)</span>
                          </div>

                          {/* Price & Installments (Mercado Libre signature layouts) */}
                          <div className="mt-auto">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xl font-normal text-gray-900 font-sans">
                                $ {p.price.toLocaleString()}
                              </span>
                              {discountPercent > 0 && (
                                <span className="text-xs font-semibold text-[#00a650]">
                                  {discountPercent}% OFF
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-[#00a650] font-normal mb-1">
                              Mismo precio en 6 cuotas de ${installmentsPrice.toLocaleString()} sin interés
                            </p>

                            {meta.freeShip && (
                              <div className="flex items-center gap-1 text-[11px] font-bold text-[#00a650] mt-2">
                                <Truck className="w-4 h-4 shrink-0" />
                                <span>Envío gratis</span>
                                <span className="text-gray-400 font-normal ml-0.5">llegando mañana</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded border border-gray-200">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="font-bold text-gray-700 mb-1">No hay publicaciones que coincidan con tu búsqueda</h3>
                      <p className="text-xs text-gray-400">Revisá la ortografía o utilizá palabras más genéricas.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* 3. DETAILED VIEW CLONE OF MERCADO LIBRE */
            <motion.div 
              key="detail-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white border border-gray-200 rounded-md shadow-sm p-4 md:p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Left Side: Thumbnail list & Main zoomable image (7 cols) */}
                <div className="md:col-span-7 flex flex-col md:flex-row gap-4">
                  {/* Thumbnails list */}
                  <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto">
                    {selectedProduct.images.map((img, idx) => (
                      <button 
                        key={idx}
                        onMouseEnter={() => setCurrentImgIdx(idx)}
                        onClick={() => setCurrentImgIdx(idx)}
                        className={cn(
                          "w-12 h-12 md:w-16 md:h-16 border rounded bg-white p-1 overflow-hidden shrink-0 flex items-center justify-center transition-all",
                          currentImgIdx === idx ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200 hover:border-blue-300"
                        )}
                      >
                        <img src={img} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>

                  {/* Main Display Image */}
                  <div 
                    className="flex-grow aspect-square bg-white border border-gray-100 rounded overflow-hidden p-6 flex items-center justify-center order-1 md:order-2 relative cursor-zoom-in group/zoom select-none"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onMouseMove={handleMouseMove}
                  >
                    <img 
                      src={selectedProduct.images[currentImgIdx]} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain mix-blend-multiply pointer-events-none" 
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Semi-transparent Selector/Lens box (follows mouse) */}
                    {isHovering && (
                      <div 
                        className="absolute border border-blue-400 bg-blue-400/10 pointer-events-none rounded shadow-sm z-10"
                        style={{
                          width: '33.333%',
                          height: '33.333%',
                          left: `${Math.max(16.667, Math.min(83.333, zoomPos.x))}%`,
                          top: `${Math.max(16.667, Math.min(83.333, zoomPos.y))}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )}
                    
                    {/* Share / Favorite mini float keys */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover/zoom:opacity-100 transition-opacity z-20">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(selectedProduct.id);
                        }}
                        className={cn(
                          "p-2.5 bg-white rounded-full shadow-md border border-gray-200 hover:scale-110 active:scale-95 transition-all text-gray-600 cursor-pointer",
                          favorites.includes(selectedProduct.id) && "text-red-500 bg-red-50 border-red-100"
                        )}
                        title={favorites.includes(selectedProduct.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                      >
                        <Heart className={cn("w-4.5 h-4.5 transition-colors", favorites.includes(selectedProduct.id) && "fill-red-500")} />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(selectedProduct.id);
                          }}
                          className={cn(
                            "p-2.5 bg-white rounded-full shadow-md border border-gray-200 hover:scale-110 active:scale-95 transition-all text-gray-600 cursor-pointer",
                            copied && "text-blue-500 bg-blue-50 border-blue-100"
                          )}
                          title="Copiar enlace"
                        >
                          <Share2 className="w-4.5 h-4.5" />
                        </button>
                        {copied && (
                          <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-zinc-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50 animate-fade-in flex items-center gap-1.5 border border-zinc-800">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ¡Enlace copiado!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Product Purchase Block (5 cols) */}
                <div className="md:col-span-5 border border-gray-200 rounded-md p-6 bg-white shadow-sm flex flex-col h-fit relative">
                  {isHovering && (
                    <div className="absolute inset-0 bg-white z-40 rounded-md overflow-hidden flex flex-col border-2 border-blue-100 shadow-xl animate-fade-in">
                      <div className="w-full h-full relative overflow-hidden bg-white flex items-center justify-center">
                        <div 
                          className="absolute w-full h-full bg-no-repeat pointer-events-none"
                          style={{
                            backgroundImage: `url(${selectedProduct.images[currentImgIdx]})`,
                            backgroundSize: '300%', // 3x zoom
                            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                            width: '100%',
                            height: '100%',
                          }}
                        />
                        {/* Elegant live-zoom overlay badge */}
                        <div className="absolute bottom-3 left-3 bg-zinc-900/90 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm tracking-widest uppercase flex items-center gap-1.5 backdrop-blur-xs select-none">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                          Zoom de Detalle
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    
                    {/* State tags */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Nuevo</span>
                      <span>•</span>
                      <span>+100 vendidos</span>
                    </div>

                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
                      {selectedProduct.name}
                    </h1>

                    {/* Ratings */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-blue-500 hover:underline cursor-pointer">124 opiniones</span>
                    </div>

                    {/* Pricing with ML styling */}
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-light text-gray-900">$ {selectedProduct.price.toLocaleString()}</span>
                        {selectedProductMeta && selectedProductMeta.disc > 0 && (
                          <span className="text-sm font-semibold text-[#00a650] bg-[#00a650]/10 px-2 py-0.5 rounded">
                            {selectedProductMeta.disc}% OFF
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#00a650] font-normal mt-1">
                        en 6 cuotas sin interés de ${(Math.round(selectedProduct.price / 6)).toLocaleString()} pagando con Mercado Pago
                      </p>
                      <span className="text-[11px] text-blue-500 hover:underline block mt-2 cursor-pointer">Ver los medios de pago disponibles</span>
                    </div>

                    {/* Delivery Block */}
                    <div className="space-y-4 py-2 border-b border-gray-100">
                      <div className="flex gap-3">
                        <Truck className="w-5 h-5 text-[#00a650] shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="text-[#00a650] font-bold">
                            {selectedProductMeta?.freeShip ? "Llega gratis mañana" : "Envío a acordar con el vendedor"}
                          </p>
                          <p className="text-gray-500 mt-1">Beneficio de Mercado Puntos</p>
                          <button className="text-blue-500 hover:underline font-semibold mt-1 inline-block" onClick={() => setIsEditingPostal(true)}>
                            Enviar a {locationText}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 text-xs">
                        <Shield className="w-5 h-5 text-[#00a650] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-gray-800 font-bold">Compra Protegida</p>
                          <p className="text-gray-500 mt-0.5">Recibí el producto que esperabas o te devolvemos tu dinero.</p>
                        </div>
                      </div>
                    </div>

                    {/* Stock available select */}
                    <div className="py-2">
                      <span className="text-xs text-gray-500 font-bold block mb-2">Cantidad a comprar</span>
                      <div className="flex items-center gap-3 border border-gray-200 rounded-md px-3 py-1.5 w-fit">
                        <button 
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="text-gray-500 hover:text-black p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-sm w-8 text-center">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(prev => Math.min(20, prev + 1))}
                          className="text-gray-500 hover:text-black p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-gray-400">(20 disponibles)</span>
                      </div>
                    </div>

                    {/* Action buttons styled exactly like Mercado Libre */}
                    <div className="space-y-3 pt-4">
                      <button 
                        onClick={() => handleMpCheckout(selectedProduct, quantity)}
                        className="w-full bg-[#3483fa] text-white font-bold text-sm py-3.5 rounded-md hover:bg-[#2968c8] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ShoppingBag className="w-4 h-4" /> Comprar ahora
                      </button>

                      <button 
                        onClick={() => {
                          addToCart(selectedProduct, quantity);
                          setCustomAlert({
                            show: true,
                            title: '¡Agregado con Éxito!',
                            message: `Se agregaron ${quantity} unidades de "${selectedProduct.name}" a tu carrito de compras de ML3D.`,
                            submessage: 'Podés seguir explorando o acceder al carrito desde el menú superior de la tienda para completar el pedido.',
                            iconType: 'success',
                            productImage: selectedProduct.images?.[0] || 'https://picsum.photos/seed/nova/200'
                          });
                        }}
                        className="w-full bg-[#e3edfb] text-[#3483fa] font-bold text-sm py-3.5 rounded-md hover:bg-[#d9e7fa] transition-colors"
                      >
                        Agregar al carrito
                      </button>
                    </div>

                    {/* Secure badge */}
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 pt-3">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Pago seguro garantizado por Mercado Pago</span>
                    </div>

                  </div>
                </div>

              </div>

              {/* Technical description and Ask questions (ML style tabs) */}
              <div className="border-t border-gray-100 mt-12 pt-10 grid grid-cols-1 md:grid-cols-12 gap-12">
                
                {/* Description and characteristics (8 cols) */}
                <div className="md:col-span-8 space-y-8">
                  <div>
                    <h2 className="text-xl font-normal text-gray-800 mb-4">Descripción</h2>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-w-3xl">
                      {selectedProductMeta?.desc || selectedProduct.description}
                    </div>
                  </div>

                  {/* Dynamic Q&A Segment */}
                  <div className="border-t border-gray-100 pt-8 space-y-6">
                    <h2 className="text-xl font-normal text-gray-800">Preguntas y respuestas</h2>
                    
                    {/* Ask input form */}
                    <form onSubmit={handleAddQuestion} className="space-y-3">
                      <h3 className="font-bold text-sm text-gray-700">Preguntale al vendedor</h3>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Escribí tu pregunta... (ej: ¿Tienen stock en color dorado?)"
                          className="flex-grow bg-white border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                        />
                        <button 
                          type="submit"
                          className="bg-[#3483fa] text-white font-bold text-sm px-6 py-3 rounded hover:bg-[#2968c8] transition-colors shrink-0"
                        >
                          Preguntar
                        </button>
                      </div>
                    </form>

                    {/* Historical questions list */}
                    <div className="space-y-5 pt-4">
                      <h3 className="font-bold text-sm text-gray-700">Últimas preguntas realizadas</h3>
                      
                      <div className="space-y-4 divide-y divide-gray-100">
                        {questions.map((item, idx) => (
                          <div key={idx} className="pt-4 first:pt-0 text-sm">
                            <div className="text-gray-800 flex items-start gap-1">
                              <span className="font-normal">{item.q}</span>
                            </div>
                            {item.a ? (
                              <div className="text-gray-500 pl-4 mt-1 border-l-2 border-gray-200 flex items-start gap-1">
                                <span className="text-xs uppercase bg-gray-100 text-gray-500 px-1 py-0.5 rounded font-black mr-1 text-[8px]">RESPUESTA</span>
                                <p className="leading-relaxed">{item.a} <span className="text-[10px] text-gray-400 italic ml-2">({item.date})</span></p>
                              </div>
                            ) : (
                              <div className="text-blue-500/80 pl-4 mt-1 border-l-2 border-blue-200 flex items-center gap-1.5 animate-pulse">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span className="text-xs">El vendedor está redactando una respuesta...</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seller specs / credentials box (4 cols) */}
                <div className="md:col-span-4 bg-gray-50 rounded-md p-6 border border-gray-200 space-y-6">
                  <h3 className="font-bold text-sm text-gray-800">Información de la tienda</h3>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 border border-orange-200 rounded-full flex items-center justify-center font-black text-xs">
                      N3D
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Nova3D Argentina</h4>
                      <p className="text-xs text-[#00a650] font-semibold flex items-center gap-1">
                        <Store className="w-3.5 h-3.5" /> MercadoLíder Platinum
                      </p>
                    </div>
                  </div>

                  {/* ML Temperature/Rating scale bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      <span>Malo</span>
                      <span>Excelente</span>
                    </div>
                    <div className="grid grid-cols-5 h-2 rounded overflow-hidden gap-0.5">
                      <div className="bg-[#ff4e4e]/40" />
                      <div className="bg-[#ffe44e]/40" />
                      <div className="bg-amber-400/40" />
                      <div className="bg-[#9fff59]/60" />
                      <div className="bg-[#00a650] shadow-sm" />
                    </div>
                    <span className="text-[11px] text-[#00a650] font-bold block">¡Es uno de los mejores vendedores del sitio!</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs divide-x divide-gray-200 pt-2">
                    <div>
                      <span className="font-bold text-gray-900 block text-sm">+5000</span>
                      <span className="text-[10px] text-gray-400">Ventas concretadas</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#00a650] block text-sm">Brinda</span>
                      <span className="text-[10px] text-gray-400">Excelente atención</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#00a650] block text-sm">Despacha</span>
                      <span className="text-[10px] text-gray-400">A tiempo siempre</span>
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 4. REAL INTEGRATION MERCADO PAGO DIALOG */}
      <AnimatePresence>
        {showMpModal && (
          <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-lg w-full border border-gray-100 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowMpModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between gap-2.5 mb-6 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100/70">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1 rounded-xl shadow-xs border border-blue-100 shrink-0">
                    <img 
                      src="https://logowik.com/content/uploads/images/mercado-pago3162.logowik.com.webp" 
                      alt="Mercado Pago Logo" 
                      className="h-8 object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback in case of network issues
                        (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/b/b5/Mercado_Libre_logo.svg";
                      }}
                    />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-black tracking-tighter text-[#003057] text-sm uppercase">mercado pago</span>
                    <span className="text-[10px] font-bold tracking-wider text-[#00aae4] uppercase mt-0.5">pasarela segura</span>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-emerald-200 tracking-wider">
                  Oficial
                </div>
              </div>

              {checkoutLoading ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-gray-700">Generando preferencia de pago segura...</p>
                  <p className="text-xs text-gray-400">Conectando con servidores de Mercado Pago Argentina</p>
                </div>
              ) : simulatedPaymentSuccess ? (
                <div className="py-8 text-center space-y-5">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 uppercase tracking-tight">¡Pago Aprobado con Éxito!</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      El sistema ha recibido la transacción mediante Mercado Pago de forma exitosa.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-left text-xs space-y-1 font-mono">
                    <p><span className="text-gray-400">PREF_ID:</span> pref_sandbox_{Math.random().toString(36).substring(2, 8)}</p>
                    <p><span className="text-gray-400">ESTADO:</span> approved</p>
                    <p><span className="text-gray-400">MONTO:</span> ARS $ {(selectedProduct ? selectedProduct.price * quantity : 0).toLocaleString()}</p>
                    <p><span className="text-gray-400">COMPRADOR:</span> {user?.email || 'anonimo@example.com'}</p>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        setShowMpModal(false);
                        setActiveSubSection('tracking');
                      }}
                      className="w-full bg-[#00a650] hover:bg-[#008f43] text-white font-bold text-sm py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer animate-pulse"
                    >
                      <Truck className="w-5 h-5 shrink-0" /> Hacer Seguimiento en Vivo
                    </button>
                    <button 
                      onClick={() => setShowMpModal(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Volver a la tienda
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50/60 border-l-4 border-blue-500 p-4 rounded-r">
                    <div className="flex gap-2 text-xs text-blue-800">
                      <AlertCircle className="w-5 h-5 shrink-0 text-blue-600" />
                      <div>
                        <p className="font-bold text-[#003057]">Información de pago seguro</p>
                        <p className="mt-1 leading-relaxed text-[#004e82]">
                          Estás por realizar tu compra mediante la pasarela segura de Mercado Pago. Podés abonar en cuotas con tarjeta de crédito, tarjeta de débito, dinero en cuenta o en efectivo mediante redes de pago. Tu dinero y datos están 100% protegidos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Detalle del Cobro</span>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">{selectedProduct?.name} (x{quantity})</span>
                      <span className="font-bold text-gray-900">$ {((selectedProduct?.price || 0) * quantity).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-100 pb-2 text-blue-600">Información del Comprador y Envío</span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Email para la Factura</label>
                      <input 
                        type="email"
                        value={checkoutEmail}
                        onChange={(e) => setCheckoutEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Dirección de Envío Completa</label>
                      <input 
                        type="text"
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        placeholder="Calle, Altura, Piso/Depto, Localidad"
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-800"
                      />
                      <span className="text-[9px] text-gray-400 font-medium italic block">Se enviará la factura de compra y alerta de envío a este email y dirección física.</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {checkoutUrl && (
                      <a 
                        href={checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 text-white font-bold text-sm py-3.5 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm text-center"
                      >
                        <CreditCard className="w-5 h-5" /> Abrir Pasarela Oficial Mercado Pago
                      </a>
                    )}
                    
                    <button 
                      onClick={simulateSuccess}
                      className="w-full bg-[#00a650] text-white font-bold text-sm py-3 rounded-lg hover:bg-[#008f43] transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" /> Simular Aprobación de Sandbox
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom High-Fidelity Alert Modal */}
      <AnimatePresence>
        {customAlert.show && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={cn(
                "w-full max-w-md rounded-2xl shadow-2xl p-6 border overflow-hidden relative",
                theme === 'dark' ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              {/* Top accent glow */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1.5",
                customAlert.iconType === 'success' ? "bg-emerald-500 animate-pulse" : customAlert.iconType === 'error' ? "bg-rose-500" : "bg-blue-500"
              )} />

              <button 
                onClick={() => setCustomAlert(prev => ({ ...prev, show: false }))}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mt-3">
                {/* Icon wrapper */}
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner",
                  customAlert.iconType === 'success' ? "bg-emerald-500/10 text-emerald-500" : customAlert.iconType === 'error' ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  {customAlert.iconType === 'success' ? (
                    <Check className="w-8 h-8 stroke-[3]" />
                  ) : customAlert.iconType === 'error' ? (
                    <X className="w-8 h-8 stroke-[3]" />
                  ) : (
                    <AlertCircle className="w-8 h-8 stroke-[3]" />
                  )}
                </div>

                <h3 className="text-lg font-black tracking-tight mb-2 uppercase text-zinc-800 dark:text-white font-sans">
                  {customAlert.title}
                </h3>
                
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed px-2">
                  {customAlert.message}
                </p>

                {/* Optional Product Image Preview */}
                {customAlert.productImage && (
                  <div className="mt-4 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center gap-3 w-full text-left">
                    <img 
                      src={customAlert.productImage} 
                      alt="Producto" 
                      className="w-12 h-12 rounded-lg object-cover bg-white border border-zinc-200 shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-200">{selectedProduct?.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">Cantidad: {quantity} u. | $ {(selectedProduct?.price || 0).toLocaleString()} c/u</p>
                    </div>
                  </div>
                )}

                {customAlert.submessage && (
                  <p className="text-xs text-zinc-400 mt-4 leading-normal italic">
                    {customAlert.submessage}
                  </p>
                )}

                <div className="mt-6 w-full">
                  <button 
                    onClick={() => setCustomAlert(prev => ({ ...prev, show: false }))}
                    className={cn(
                      "w-full font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-sm active:scale-98",
                      customAlert.iconType === 'success' 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                        : customAlert.iconType === 'error' 
                          ? "bg-rose-600 hover:bg-rose-500 text-white" 
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                    )}
                  >
                    Seguir Comprando
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
