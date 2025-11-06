// lib/supabase.ts (CORRIGIDO)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});


export interface Usuario {

  id: string;
  email: string;
  nome: string;
  nome_do_negocio: string;
  telefone?: string;
  endereco?: string;
  slug: string;
  status_assinatura: 'trial' | 'active' | 'past_due' | 'canceled';
  trial_termina_em: string;
  assinatura_id?: string;
  mercado_pago_key?: string;
  configuracoes: Record<string, any>;
  created_at: string;
  updated_at: string;
  has_completed_onboarding: boolean;
}

export interface Profissional {
  id: string;
  usuario_id: string;
  nome: string;
  email?: string;
  telefone?: string;
  especialidades: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Servico {
  id: string;
  usuario_id: string;
  profissional_id: string;
  nome: string;
  descricao: string;
  duracao: number;
  preco: number;
  requer_sinal: boolean;
  valor_sinal: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  usuario_id: string;
  nome: string;
  telefone: string;
  email?: string;
  total_agendamentos: number;
  ultima_visita?: string;
  created_at: string;
  updated_at: string;
}

export interface Agendamento {
  id: string;
  usuario_id: string;
  cliente_id: string;
  servico_id: string;
  profissional_id: string;
  data_agendamento: string;
  hora_agendamento: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  status_pagamento: 'pending' | 'partial' | 'paid';
  valor_total: number;
  valor_sinal: number;
  pagamento_id?: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export interface HorarioFuncionamento {
  id: string;
  usuario_id: string;
  dia_semana: number;
  ativo: boolean;
  hora_inicio: string;
  hora_fim: string;
  intervalos: Array<{ start: string; end: string }>;
  created_at: string;
  updated_at: string;
}