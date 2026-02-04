import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
    Calendar,
    DollarSign,
    Users,
    TrendingUp,
    CheckCircle,
    Settings as SettingsIcon,
    Plus, 
    Copy,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { appointments, clients, services } = useData();
    const { user, usuario, resendConfirmationEmail } = useAuth();
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
        <button onClick={() => navigate(path)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:border-gray-300 transition-all w-full h-full">
            <div className={`p-3 rounded-lg bg-${color}-100 inline-block mb-4`}>
                <Icon size={24} className={`text-${color}-600`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </button>
    );

    // --- <<< 3. URL COMPLETA E FUNÇÃO DE COPIAR ---
    const fullPublicUrl = `https://agend-pro.vercel.app/booking/${usuario?.slug || ''}`;
    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullPublicUrl);
        alert('Link copiado para a área de transferência!');
    };

    // --- Início do Layout Otimizado ---
    return (
        // <<< 2. Adicionei 'relative' e 'pb-24' (padding-bottom) para dar espaço para o FAB
        <div className="relative p-4 md:p-6 pb-24 min-h-screen">

            {/* Banner de Confirmação (Sem alterações) */}
            {user && !user.email_confirmed_at && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-6" role="alert">
                    {/* ... (conteúdo do banner sem alteração) ... */}
                </div>
            )}

            {/* Header (Sem alterações) */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
                <p className="text-gray-600 text-sm md:text-base">Visão geral do seu negócio em tempo real</p>
            </div>

            {/* --- <<< 4. NOVO CARD DE COMPARTILHAMENTO --- */}
            <div className="mb-6 md:mb-8">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-2">Seu Link de Agendamento</h3>
                    <p className="text-sm text-gray-600 mb-3">Este é o link para compartilhar com seus clientes.</p>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-gray-50 rounded-lg border">
                        <input
                            type="text"
                            value={fullPublicUrl}
                            readOnly
                            className="flex-1 w-full sm:w-auto bg-transparent text-sm text-gray-600 focus:outline-none"
                        />
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center justify-center w-full sm:w-auto px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
                        >
                            <Copy size={16} className="mr-2"/>
                            Copiar
                        </button>
                        <a
                            href={fullPublicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full sm:w-auto px-3 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            <ExternalLink size={16} className="mr-2"/>
                            Abrir
                        </a>
                    </div>
                </div>
            </div>
            {/* --- FIM DO NOVO CARD --- */}

            {/* 1. AGENDAMENTOS DE HOJE (MOVIDO PARA O TOPO) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 md:mb-8">
                <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Agendamentos de Hoje</h2>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                        </p>
                    </div>
                    <button onClick={() => navigate('/schedule')} className="text-xs md:text-sm text-blue-600 font-medium hover:text-blue-700">
                        Ver agenda
                    </button>
                </div>
                <div className="p-4 md:p-6">
                    {todayAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-sm md:text-base">Nenhum agendamento para hoje. Aproveite o dia!</p>
                        </div>
                    ) : (
                        // <<< 3. LISTA DE AGENDAMENTOS MELHORADA
                        <div className="space-y-3">
                            {todayAppointments
                                .sort((a, b) => (a.hora_agendamento || '').localeCompare(b.hora_agendamento || ''))
                                // .slice(0, 5) <<< 4. REMOVI O LIMITE .slice(0, 5)
                                .map((appointment) => {
                                    const client = clients.find(c => c.id === appointment.cliente_id);
                                    const service = services.find(s => s.id === appointment.servico_id); // Busquei o serviço

                                    return (
                                        // <<< 5. CARD DE AGENDAMENTO OTIMIZADO PARA MOBILE
                                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                                            <div className="flex items-center space-x-3">
                                                {/* Destaque para a Hora */}
                                                <span className="font-bold text-sm sm:text-base text-blue-600 w-12 text-center">
                          {appointment.hora_agendamento || '--:--'}
                        </span>
                                                {/* Divisor Visual */}
                                                <div className="h-10 w-px bg-gray-300 hidden sm:block"></div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                                                        {client?.nome || 'Cliente avulso'}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        {service?.name || 'Serviço'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm sm:text-base font-semibold text-gray-900 text-right">
                                                R$ {(appointment.valor_total || 0).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. AÇÕES RÁPIDAS (MOVIDO PARA O MEIO) */}
            <div className="mb-6 md:mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Ações Rápidas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ActionCard title="Ver Agenda" subtitle="Visualize e gerencie agendamentos" icon={Calendar} color="blue" path="/schedule" />
                    <ActionCard title="Clientes" subtitle="Gerencie sua base de clientes" icon={Users} color="purple" path="/clients" />
                    <ActionCard title="Configurações" subtitle="Ajuste seu perfil e negócio" icon={SettingsIcon} color="gray" path="/settings" />
                </div>
            </div>

            {/* 3. MÉTRICAS DO MÊS (MOVIDO PARA O FIM) */}
            <div className="mb-6 md:mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Métricas do Mês</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard title="Agendamentos Hoje" value={todayAppointments.length} icon={Calendar} color="blue" />
                    <StatCard title="Concluídos (mês)" value={completedAppointmentsThisMonth.length} icon={CheckCircle} color="green" />
                    <StatCard title="Faturamento (mês)" value={`R$ ${totalRevenueThisMonth.toFixed(2).replace('.', ',')}`} icon={DollarSign} color="purple" />
                    <StatCard title="Taxa de Conclusão" value={`${completionRateThisMonth}%`} icon={TrendingUp} color="orange" />
                </div>
            </div>

            {/* --- FIM DA REORDENAÇÃO --- */}


            {/* --- <<< 6. BOTÃO DE AÇÃO FLUTUANTE (FAB) --- */}
            <button
                onClick={() => navigate('/schedule')} // Por enquanto, leva para a agenda
                className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-lg text-white hover:bg-blue-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Adicionar novo agendamento"
            >
                <Plus size={28} />
            </button>
        </div>
    );
}