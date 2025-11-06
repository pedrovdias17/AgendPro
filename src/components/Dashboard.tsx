import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  Settings as SettingsIcon,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { appointments, clients, services } = useData();
  const { user, resendConfirmationEmail } = useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // --- LÓGICA DE CÁLCULO DAS MÉTRICAS (sem alterações) ---
  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const appointmentsThisMonth = appointments.filter(apt => {
    const aptDate = new Date(apt.data_agendamento + 'T00:00:00');
    return aptDate.getFullYear() === currentYear && aptDate.getMonth() === currentMonth;
  });

  const todayAppointments = appointments.filter(apt => apt.data_agendamento === todayISO);
  const completedAppointmentsThisMonth = appointmentsThisMonth.filter(apt => apt.status === 'completed');

  const totalRevenueThisMonth = appointmentsThisMonth.reduce((sum, apt) => {
    if (apt.status === 'completed') {
      return sum + (apt.valor_total || 0);
    }
    if (apt.status === 'confirmed' && apt.status_pagamento === 'partial') {
      return sum + (apt.valor_sinal || 0);
    }
    return sum;
  }, 0);

  const relevantAppointmentsThisMonth = appointmentsThisMonth.filter(
    apt => apt.status === 'completed' || apt.status === 'cancelled'
  );
  const completionRateThisMonth = relevantAppointmentsThisMonth.length > 0 
    ? Math.round((completedAppointmentsThisMonth.length / relevantAppointmentsThisMonth.length) * 100)
    : 0;

  const handleResendEmail = async () => {
    if (!user?.email) return;
    setIsResending(true);
    setResendMessage('');
    const { success, error } = await resendConfirmationEmail(user.email);
    if (success) {
      setResendMessage('Link de confirmação reenviado com sucesso!');
    } else {
      setResendMessage(error || 'Ocorreu um erro ao reenviar o email.');
    }
    setIsResending(false);
  };
  
  // --- COMPONENTES VISUAIS (sem alterações na estrutura interna) ---
  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: React.ElementType, color: string }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon size={20} className={`text-${color}-600`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );

  const ActionCard = ({ title, subtitle, icon: Icon, color, path }: { title: string, subtitle: string, icon: React.ElementType, color: string, path: string }) => (
    <button onClick={() => navigate(path)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:border-gray-300 transition-all w-full">
      <div className={`p-3 rounded-lg bg-${color}-100 inline-block mb-4`}>
        <Icon size={24} className={`text-${color}-600`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </button>
  );

  return (
    // Ajuste no padding geral para telas pequenas
    <div className="p-4 md:p-6"> 
      {/* Banner de Confirmação (sem alterações) */}
      {user && !user.email_confirmed_at && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-6" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 text-yellow-500 mr-4" /></div>
            <div>
              <p className="font-bold">Confirme seu endereço de email</p>
              <p className="text-sm">Para garantir o pleno funcionamento do AgendPro e habilitar sua página pública de agendamentos, por favor, clique no link que enviamos para <strong>{user.email}</strong>.</p>
              <div className="mt-2">
                <button onClick={handleResendEmail} disabled={isResending} className="text-sm font-medium text-yellow-800 hover:text-yellow-900 disabled:opacity-50">
                  {isResending ? 'Reenviando...' : 'Reenviar email de confirmação'}
                </button>
                {resendMessage && <span className="ml-4 text-sm">{resendMessage}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 md:mb-8">
        {/* Ajuste no tamanho da fonte para mobile */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
        <p className="text-gray-600 text-sm md:text-base">Visão geral do seu negócio em tempo real</p>
      </div>

      {/* --- Stats Grid (AJUSTE PRINCIPAL AQUI) --- */}
      {/* Começa com 1 coluna, muda para 2 em telas 'sm' e para 4 em telas 'lg' */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatCard title="Agendamentos Hoje" value={todayAppointments.length} icon={Calendar} color="blue" />
        <StatCard title="Concluídos (mês)" value={completedAppointmentsThisMonth.length} icon={CheckCircle} color="green" />
        <StatCard title="Faturamento (mês)" value={`R$ ${totalRevenueThisMonth.toFixed(2).replace('.', ',')}`} icon={DollarSign} color="purple" />
        <StatCard title="Taxa de Conclusão" value={`${completionRateThisMonth}%`} icon={TrendingUp} color="orange" />
      </div>

      {/* --- Content Grid (AJUSTE PRINCIPAL AQUI) --- */}
      {/* Começa com 1 coluna, muda para 3 colunas em telas 'lg' */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Coluna da Esquerda: Ações */}
        {/* Ocupa 1 coluna no mobile, continua 1 coluna no desktop (lg:col-span-1) */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <ActionCard title="Ver Agenda" subtitle="Visualize e gerencie agendamentos" icon={Calendar} color="blue" path="/schedule" />
          <ActionCard title="Clientes" subtitle="Gerencie sua base de clientes" icon={Users} color="purple" path="/clients" />
          <ActionCard title="Configurações" subtitle="Ajuste seu perfil e negócio" icon={SettingsIcon} color="gray" path="/settings" />
        </div>

        {/* Coluna da Direita: Agendamentos de Hoje */}
        {/* Ocupa 1 coluna no mobile, expande para 2 colunas no desktop (lg:col-span-2) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              {/* Ajuste no tamanho da fonte para mobile */}
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Agendamentos de Hoje</h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </p>
            </div>
            <button onClick={() => navigate('/schedule')} className="text-xs md:text-sm text-blue-600 font-medium hover:text-blue-700">
              Ver todos
            </button>
          </div>
          <div className="p-4 md:p-6">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm md:text-base">Nenhum agendamento para hoje. Aproveite o dia!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments
                  .sort((a, b) => (a.hora_agendamento || '').localeCompare(b.hora_agendamento || ''))
                  .slice(0, 5)
                  .map((appointment) => {
                    const client = clients.find(c => c.id === appointment.cliente_id);
                    return (
                      // Ajuste no layout interno do card de agendamento para mobile
                      <div key={appointment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 text-gray-600 hidden sm:block"> {/* Esconde ícone no mobile */}
                            <Clock size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm sm:text-base">{client?.nome || 'Cliente não encontrado'}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{appointment.hora_agendamento}</p>
                          </div>
                        </div>
                        <div className="text-base sm:text-lg font-semibold text-gray-900 mt-1 sm:mt-0 self-end sm:self-center"> {/* Alinha à direita no mobile */}
                          R$ {(appointment.valor_total || 0).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}