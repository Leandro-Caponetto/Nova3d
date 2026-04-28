import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

export function UsersList({ theme, t }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <div className={cn("border rounded-[48px] p-12 shadow-3xl",
      theme === 'dark' ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200")}>
      <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-16">NETWORK_OPERATORS_REGISTRY</h3>
      
      {loading ? (
        <div className="animate-pulse text-zinc-500 font-black uppercase text-[10px] tracking-widest italic">Syncing with Central Mesh...</div>
      ) : (
        <div className="space-y-6">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-6 rounded-2xl bg-black/10 border border-white/5 group hover:border-primary/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="text-primary w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black italic uppercase italic tracking-tighter">{user.full_name || 'NO_NAME_ASSIGNED'}</p>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-widest">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={cn("text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border",
                  user.role === 'admin' ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-white/5 text-zinc-500 border-white/5")}>
                  {user.role || 'USER'}
                </span>
                <p className="text-[8px] text-zinc-600 mt-2 font-mono">Mesh Join: {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
