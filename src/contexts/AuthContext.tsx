import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { supabase, Usuario } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null | undefined;
  usuario: Usuario | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, nome: string, nomeDoNegocio: string, slug: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<Usuario>) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>; 
   resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>; 
  }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined); 
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [session, setSession] = useState<Session | null>(null);

const loadUserProfile = useCallback(async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // <--- A MUDANÇA É AQUI

    if (error) {
      console.error('Erro ao carregar perfil:', error);
      return;
    }

    // Se data for null, significa que o usuário é novo e precisa de Onboarding
    setUsuario(data); 

  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
  }
}, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUsuario(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);
  
  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro no Supabase ao fazer logout:", error);
        return { success: false, error: error.message };
      }
      setUser(null);
      setUsuario(null);
      setSession(null);
      return { success: true };
    } catch (err: any) {
      console.error("Erro inesperado ao fazer logout:", err);
      return { success: false, error: String(err.message || err) };
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; }> => { 
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);
  
  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string; }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard' 
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Erro no login com Google:", err);
      return { success: false, error: err.message };
    }
  }, []);

  // --- FUNÇÃO SIGNUP ATUALIZADA ---
  const signup = useCallback(async (email: string, password: string, nome: string, nomeDoNegocio: string, slug: string): Promise<{ success: boolean; error?: string; }> => {
    try {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              nome: nome,
              nome_do_negocio: nomeDoNegocio, // MUDANÇA AQUI
              slug: slug
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            return { success: false, error: 'Este email já está cadastrado. Tente fazer login.' };
          }
          return { success: false, error: error.message };
        }

        if (!data.user && !data.session) {
             alert('Conta criada com sucesso! Enviamos um link de confirmação para o seu email.');
             return { success: true };
        }
        
        return { success: true };

    } catch (error) {
        console.error('Erro inesperado ao criar conta:', error);
        return { success: false, error: 'Ocorreu um erro inesperado.' };
    }
  }, []);
  
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string; }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/update-password',
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  // --- FUNÇÃO updateProfile ATUALIZADA ---
  const updateProfile = useCallback(async (data: Partial<Usuario>): Promise<{ success: boolean; error?: string; }> => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    try {
      // Renomeia a chave de 'nome_studio' para 'nome_do_negocio' antes de enviar
      const { nome_studio, ...restOfData } = data;
      const updateData = {
        ...restOfData,
        ...(nome_studio && { nome_do_negocio: nome_studio }) // Mapeia se existir
      };

      const { error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { success: false, error: error.message };
      }
      await loadUserProfile(user.id);
      return { success: true };
    } catch (err: any) {
      console.error("Erro inesperado ao atualizar perfil:", err);
      return { success: false, error: 'Erro inesperado ao atualizar perfil' };
    }
  }, [user, loadUserProfile]);

  const resendConfirmationEmail = useCallback(async (email: string): Promise<{ success: boolean; error?: string; }> => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);
  
  const memoizedValue = useMemo(() => ({
    user,
    usuario,
    session,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
    loginWithGoogle
  }), [user, usuario, session, login, signup, logout, resetPassword, updateProfile, loginWithGoogle]);

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}