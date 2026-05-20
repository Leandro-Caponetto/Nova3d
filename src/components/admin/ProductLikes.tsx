import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, TrendingUp, Package, Search, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

export function ProductLikes({ theme, t }: any) {
  const [likesData, setLikesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLikesData = async () => {
    setLoading(true);
    try {
      // Fetch all products first
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, name, category, images');
      
      if (prodError) throw prodError;

      // Fetch likes count per product
      const { data: likes, error: likesError } = await supabase
        .from('product_likes')
        .select('product_id');
      
      if (likesError) throw likesError;

      // Aggregate likes
      const likesCount = likes.reduce((acc: any, curr: any) => {
        acc[curr.product_id] = (acc[curr.product_id] || 0) + 1;
        return acc;
      }, {});

      const processedData = products.map(p => ({
        ...p,
        likes: likesCount[p.id] || 0
      })).sort((a, b) => b.likes - a.likes);

      setLikesData(processedData);
    } catch (err) {
      console.error('Error fetching likes data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikesData();
  }, []);

  const filteredData = likesData.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalLikes = likesData.reduce((acc, curr) => acc + curr.likes, 0);
  const topProduct = likesData[0];

  return (
    <div className="space-y-8 pb-32">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn("p-6 rounded-3xl border", theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500 fill-current" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Likes</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black italic tracking-tighter">{totalLikes}</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">INTERACTIONS</span>
          </div>
        </div>

        <div className={cn("p-6 rounded-3xl border", theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Top Trending</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black italic tracking-tighter truncate max-w-[200px]">
              {topProduct?.name || '---'}
            </span>
            {topProduct && (
              <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest italic">
                {topProduct.likes} LIKES
              </span>
            )}
          </div>
        </div>

        <div className={cn("p-6 rounded-3xl border", theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Conversion_Target</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
            Los productos con más likes tienen un 40% más de probabilidad de transformarse en pedidos directos.
          </p>
        </div>
      </div>

      {/* Main List */}
      <div className={cn("rounded-[32px] border overflow-hidden", theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}>
        <div className="p-8 border-b border-zinc-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tighter italic">Popular_Feedback_System</h3>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Análisis de compromiso del cliente por pieza</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="FILTRAR_PRODUCTO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn("pl-11 pr-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all w-64 focus:outline-none focus:ring-2 focus:ring-primary/20",
                theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-zinc-50 border-zinc-200")}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-500/10 bg-black/5 dark:bg-white/5">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Producto</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Categoría</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Engagement_Score</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-500/10">
              {filteredData.map((item, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id} 
                  className="group hover:bg-zinc-500/5 transition-colors"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl border border-zinc-500/10 overflow-hidden bg-black flex-shrink-0">
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover opacity-80" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest italic truncate max-w-[200px]">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-lg bg-zinc-500/10 text-zinc-500">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Heart className={cn("w-4 h-4", item.likes > 0 ? "text-rose-500 fill-current" : "text-zinc-500")} />
                        <span className="text-sm font-black italic">{item.likes}</span>
                      </div>
                      <div className="w-24 h-1 bg-zinc-500/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (item.likes / (topProduct?.likes || 1)) * 100)}%` }}
                          className="h-full bg-rose-500"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-3 bg-primary/10 rounded-xl text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-500/20">
                <Search className="w-8 h-8 text-zinc-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">No se encontraron productos con engagement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
