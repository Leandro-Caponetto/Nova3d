import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Bot } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { AlertModal } from '../common/AlertModal';

export function AuthModal({ isOpen, onClose, theme, t }: { 
  isOpen: boolean, 
  onClose: () => void, 
  theme: 'dark' | 'light',
  t: any
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ open: boolean; title: string; message: string; type: 'error' | 'success' | 'info' }>({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Update or Create profile on login to ensure registry
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0],
            last_login: new Date().toISOString()
          }, { onConflict: 'id' });
        }
        onClose();
      } else {
        const { error, data } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
              phone: phone
            }
          }
        });
        if (error) throw error;
        
        // If the user is registered but needs email confirmation, data.user exists but isn't sessioned yet
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName || data.user.email!.split('@')[0],
            phone: phone,
            role: 'user',
            last_login: new Date().toISOString()
          }, { onConflict: 'id' });
          
          if (profileError) console.error("Identity Registry Error:", profileError);
        }
        
        setAlert({
          open: true,
          title: 'PROTOCOL_INITIATED',
          message: theme === 'dark' 
            ? "PROTOCOLO DE ACCESO INICIADO: Te enviamos un link de verificación. Por favor, revisá tu casilla de correo (y spam) para activar tu CORE_ID antes de ingresar." 
            : "REGISTRO CASI LISTO: Te enviamos un email de confirmación. Por favor, verificalo para poder iniciar sesión.",
          type: 'success'
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      if (error.message.includes('Email signups are disabled')) {
        setErrorMsg(theme === 'dark' ? "SISTEMA BLOQUEADO: El registro de nuevos usuarios está deshabilitado en Supabase." : "REGISTRO DESHABILITADO: Activa los registros en el panel de Supabase.");
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !alert.open) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
          />
          
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360], x: [0, 100, 0, -100, 0], y: [0, -100, 0, 100, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/20 rounded-full blur-[120px]"
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn("w-full max-w-lg rounded-[40px] p-8 lg:p-10 border relative z-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] custom-scrollbar transition-all",
              theme === 'dark' ? "bg-zinc-900/90 border-primary/20 shadow-[0_0_50px_rgba(245,158,11,0.1)]" : "bg-white/95 border-zinc-200")}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-100" />
            <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-primary transition-all hover:rotate-90 z-20">
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center mb-8">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-primary/20 rounded-[24px] flex items-center justify-center mb-6 border border-primary/40 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
              >
                <Bot className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
              </motion.div>
              <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic leading-none mb-3 text-center text-primary glow-text">
                {isLogin ? t.login : t.signup}
              </h2>
              <p className="text-primary text-[9px] uppercase font-black tracking-[0.4em] ml-1 opacity-80">
                INDUSTRIAL_ACCESS_PROTOCOL
              </p>
            </div>

            {errorMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl">
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest text-center leading-relaxed">{errorMsg}</p>
              </motion.div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Social Login Section */}
              <div className="grid grid-cols-1 gap-4 mb-4">
                <button 
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    await supabase.auth.signInWithOAuth({ provider: 'google' });
                  }}
                  className={cn("w-full py-4 rounded-xl border flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all",
                    theme === 'dark' ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-zinc-200 text-black hover:bg-zinc-50 shadow-sm")}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                  Continuar con Google
                </button>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-500/10"></div></div>
                <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest leading-none"><span className={cn("px-4", theme === 'dark' ? "bg-zinc-900" : "bg-white text-zinc-400")}>O usá tu email</span></div>
              </div>

              {!isLogin && (
                <>
                  <div className="group">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 block ml-4 group-focus-within:text-primary transition-colors">FULL_NAME</label>
                    <input 
                      type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="JOHN_DOE"
                      className={cn("w-full border rounded-2xl p-4 text-[13px] font-black tracking-widest focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:opacity-20",
                        theme === 'dark' ? "bg-black/60 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black")}
                    />
                  </div>
                  <div className="group">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 block ml-4 group-focus-within:text-primary transition-colors">PHONE_NUMBER</label>
                    <input 
                      type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+54 9 11 ..."
                      className={cn("w-full border rounded-2xl p-4 text-[13px] font-black tracking-widest focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:opacity-20",
                        theme === 'dark' ? "bg-black/60 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black")}
                    />
                  </div>
                </>
              )}
              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 block ml-4 group-focus-within:text-primary transition-colors">{t.email}</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="OPERATOR@NOVA3D.SYS"
                  className={cn("w-full border rounded-2xl p-4 text-[13px] font-black tracking-widest focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:opacity-20",
                    theme === 'dark' ? "bg-black/60 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black")}
                />
              </div>
              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 block ml-4 group-focus-within:text-primary transition-colors">{t.password}</label>
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className={cn("w-full border rounded-2xl p-4 text-[13px] font-black tracking-widest focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:opacity-20",
                    theme === 'dark' ? "bg-black/60 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black")}
                />
              </div>
              <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] bg-primary text-white hover:bg-primary-dark transition-all shadow-[0_15px_40px_rgba(245,158,11,0.4)] disabled:opacity-50 mt-6 hover:-translate-y-1 relative overflow-hidden group/btn">
                <span className="relative z-10 group-hover/btn:scale-110 transition-transform block">{loading ? 'SYNCING...' : (isLogin ? 'INITIATE_SESSION' : 'REGISTER_CORE_ID')}</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-zinc-500/10">
              <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }} className="text-[10px] font-black text-zinc-500 hover:text-primary transition-all uppercase tracking-[0.2em] italic hover:scale-105">
                {isLogin ? "IDENTITY_UNAVAILABLE? JOIN_THE_NETWORK" : "EXISTING_CORE_ID? SYNC_NOW"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AlertModal 
        isOpen={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        theme={theme}
      />
    </>
  );
}
