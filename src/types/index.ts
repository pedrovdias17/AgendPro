// src/types/index.ts
export interface Professional {
  id: string;
  usuario_id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Service {
  id: string;
  usuario_id: string;
  name: string;
  professionalId: string;
  duration: number;
  price: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  usuario_id: string;
  cliente_id: string;
  servico_id: string;
  profissional_id: string;
  data_agendamento: string;
  hora_agendamento: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
}