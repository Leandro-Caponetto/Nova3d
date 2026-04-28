/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { cn } from './lib/utils';
import type { Product, CartItem, Order } from './types';
import { AppContext, TRANSLATIONS, Language } from './lib/context';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';

// View Components
import { HomeView } from './components/views/HomeView';
import { GalleryView } from './components/views/GalleryView';
import { QuoteView } from './components/views/QuoteView';
import { CartView } from './components/views/CartView';
import { AdminView } from './components/views/AdminView';
import { ContactView } from './components/views/ContactView';
import { SubscriptionDetailsView } from './components/views/SubscriptionDetailsView';
import { CheckoutView } from './components/views/CheckoutView';

// Common Components
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { WhatsAppProductModal } from './components/common/WhatsAppProductModal';
import { ProductChatModal } from './components/chat/ProductChatModal';

export default function App() {
  const [lang, setLang] = useState<Language>('es');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const t = TRANSLATIONS[lang];

  // App State
  const [currentTab, setCurrentTab] = useState<'home' | 'gallery' | 'quote' | 'cart' | 'admin' | 'contact' | 'subscription-details' | 'checkout'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [wsProduct, setWsProduct] = useState<Product | null>(null);
  const [chatProduct, setChatProduct] = useState<Product | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Supabase Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id);
      } else {
        setProfile(null);
        if (currentTab === 'admin') setCurrentTab('home');
      }
    });

    return () => subscription.unsubscribe();
  }, [currentTab]);

  const isAdmin = user?.email === 'caponettopeppers@gmail.com';

  // Redirect non-admins from admin tab
  useEffect(() => {
    if (currentTab === 'admin' && user && !isAdmin && profile !== null) {
      setCurrentTab('home');
    }
  }, [currentTab, user, isAdmin, profile]);

  // Products
  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const setActiveTab = (tab: 'home' | 'gallery' | 'quote' | 'cart' | 'admin' | 'contact' | 'subscription-details' | 'checkout') => {
    if (tab === 'admin' && !isAdmin) {
      if (!user) setIsAuthModalOpen(true);
      return;
    }
    if (tab !== 'home' && tab !== 'gallery' && tab !== 'contact' && tab !== 'subscription-details' && !user) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const contextValue = { lang, setLang, theme, setTheme, t };

  return (
    <AppContext.Provider value={contextValue}>
      <div className={cn("min-h-screen flex flex-col transition-colors duration-500 font-sans selection:bg-amber-500/30", 
        theme === 'dark' ? "bg-bg-base text-text-base" : "bg-bg-base text-text-base")}>
                <Navbar 
          theme={theme} setTheme={setTheme} 
          lang={lang} setLang={setLang} 
          activeTab={currentTab} setActiveTab={setActiveTab} 
          cartCount={cartCount} user={user} 
          isAdmin={isAdmin}
          setIsAuthModalOpen={setIsAuthModalOpen} 
          t={t} supabase={supabase}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          theme={theme} 
          t={t} 
        />

        <main className="flex-grow">
          <AnimatePresence mode="wait">
            {currentTab === 'home' && (
              <HomeView 
                key="home" 
                onExplore={() => setActiveTab('gallery')} 
                t={t} 
                theme={theme} 
                user={user} 
                products={products} 
                onWhatsApp={setWsProduct}
                onSubscribe={(plan) => {
                  setSelectedPlan(plan);
                  setActiveTab('subscription-details');
                }}
              />
            )}
            {currentTab === 'gallery' && <GalleryView key="gallery" products={products} addToCart={addToCart} t={t} theme={theme} onWhatsApp={setWsProduct} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
            {currentTab === 'quote' && <QuoteView key="quote" products={products} t={t} theme={theme} />}
            {currentTab === 'cart' && <CartView key="cart" cart={cart} remove={removeFromCart} products={products} t={t} theme={theme} user={user} />}
            {currentTab === 'contact' && <ContactView key="contact" theme={theme} t={t} />}
            {currentTab === 'admin' && <AdminView key="admin" user={user} orders={orders} theme={theme} t={t} onProductChange={fetchProducts} />}
            {currentTab === 'subscription-details' && (
              <SubscriptionDetailsView 
                key="subscription-details"
                plan={selectedPlan}
                theme={theme}
                t={t}
                onProceed={() => {
                  if (!user) {
                    setIsAuthModalOpen(true);
                  } else {
                    setActiveTab('checkout');
                  }
                }}
                onBack={() => setActiveTab('home')}
              />
            )}
            {currentTab === 'checkout' && (
              <CheckoutView 
                key="checkout"
                plan={selectedPlan}
                user={user}
                theme={theme}
                t={t}
                onBack={() => setActiveTab('home')}
              />
            )}
          </AnimatePresence>
        </main>

        <WhatsAppProductModal 
          isOpen={!!wsProduct}
          onClose={() => setWsProduct(null)}
          product={wsProduct}
          t={t}
          theme={theme}
          onOpenChat={(p) => {
            if (!user) {
              setIsAuthModalOpen(true);
            } else {
              setChatProduct(p);
            }
          }}
        />

        <ProductChatModal 
          isOpen={!!chatProduct}
          onClose={() => setChatProduct(null)}
          product={chatProduct}
          user={user}
          theme={theme}
          t={t}
        />
        
        {/* SubscriptionModal is deprecated by full-page views */}

        <WhatsAppButton theme={theme} />

        <Footer t={t} theme={theme} />
      </div>
    </AppContext.Provider>
  );
}
