import React, { useState, useMemo, FormEvent } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus,
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  X,
  User,
  Save,
  Info
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Appointment } from '../contexts/DataContext';

// --- FUNÇÕES DE DATA (Helpers) ---
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const startDate = new Date(d.setDate(diff));
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateToISO = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
};

export default function Schedule() {
  const { 
    appointments, 
    services, 
    professionals, 
    clients, 
    addAppointment,
    markAppointmentAsCompleted,
    cancelAppointment,
    confirmAppointment,
    updateAppointmentNotes
  } = useData();

  // --- ESTADOS DA PÁGINA ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProfessional, setFilterProfessional] = useState('all');
  
  // --- ESTADOS PARA O MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'view'>('new');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentNotes, setAppointmentNotes] = useState('');

  const [formData, setFormData] = useState({
    clientName: '', clientPhone: '', clientEmail: '',
    servico_id: '', profissional_id: '',
    data_agendamento: formatDateToISO(new Date()),
    hora_agendamento: '09:00',
    status_pagamento: 'pending' as 'pending' | 'partial' | 'paid'
  });


  // --- LÓGICA DO MODAL ---
  const openNewAppointmentModal = () => {
    setModalMode('new');
    setSelectedAppointment(null);
    setFormData({
      clientName: '', clientPhone: '', clientEmail: '',
      servico_id: '', profissional_id: '',
      data_agendamento: formatDateToISO(new Date()),
      hora_agendamento: '09:00',
      status_pagamento: 'pending'
    });
    setIsModalOpen(true);
  };

  const openViewAppointmentModal = (appointment: Appointment) => {
    setModalMode('view');
    setSelectedAppointment(appointment);
    setAppointmentNotes(appointment.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;
    await updateAppointmentNotes(selectedAppointment.id, appointmentNotes);
    alert('Observações salvas com sucesso!');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };

    if (name === 'servico_id') {
      const service = services.find(s => s.id === value);
      if (service) {
        newFormData.profissional_id = service.professionalId;
      }
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.profissional_id) {
      alert('Por favor, selecione um profissional.');
      return;
    }
    
    await addAppointment({
      ...formData,
      status: 'confirmed',
      observacoes: '', // Incluir campo para evitar erros de tipo
      valor_sinal: 0,
    });

    setIsModalOpen(false);
  };
  
  // --- LÓGICA DA AGENDA SEMANAL ---
  const startOfWeek = getStartOfWeek(currentDate);
  const endOfWeek = addDays(startOfWeek, 6);

  const goToPreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const weeklyAppointments = useMemo(() => {
    const startOfWeekISO = formatDateToISO(startOfWeek);
    const endOfWeekISO = formatDateToISO(endOfWeek);

    const filtered = appointments.filter(appointment => {
      const client = clients.find(c => c.id === appointment.cliente_id);
      
      const matchesDateRange = appointment.data_agendamento >= startOfWeekISO && appointment.data_agendamento <= endOfWeekISO;
      const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
      const matchesProfessional = filterProfessional === 'all' || appointment.profissional_id === filterProfessional;
      
      if (!matchesDateRange || !matchesStatus || !matchesProfessional) return false;

      if (!searchTerm) return true;

      return client ? (
        client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.telefone || '').includes(searchTerm)
      ) : false;
    });

    const groupedByDay = filtered.reduce((acc, apt) => {
      const date = apt.data_agendamento;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(apt);
      return acc;
    }, {} as Record<string, Appointment[]>);

    for (const date in groupedByDay) {
      groupedByDay[date].sort((a, b) => (a.hora_agendamento || '').localeCompare(b.hora_agendamento || ''));
    }

    return groupedByDay;
  }, [appointments, clients, currentDate, filterStatus, searchTerm, filterProfessional]);

  const sortedDays = Object.keys(weeklyAppointments).sort();

  // --- FUNÇÕES DE FORMATAÇÃO VISUAL ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = { confirmed: 'Confirmado', pending: 'Pendente', cancelled: 'Cancelado', completed: 'Concluído' };
    return statusMap[status] || status;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agenda</h1>
          <p className="text-gray-600">Gerencie seus agendamentos</p>
        </div>
        <button onClick={openNewAppointmentModal} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus size={20} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center space-x-2">
            <button onClick={goToPreviousWeek} className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeft size={20} className="text-gray-600" /></button>
            <button onClick={goToNextWeek} className="p-2 rounded-lg hover:bg-gray-100"><ChevronRight size={20} className="text-gray-600" /></button>
            <span className="font-medium text-gray-700 w-48 text-center">
              {startOfWeek.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})} - {endOfWeek.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', year: 'numeric'})}
            </span>
          </div>
          <div className="flex items-center space-x-2 flex-1">
            <Search size={20} className="text-gray-400" />
            <input type="text" placeholder="Buscar por cliente ou telefone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User size={20} className="text-gray-400" />
              <select value={filterProfessional} onChange={(e) => setFilterProfessional(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="all">Todos Profissionais</option>
                {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="all">Todos Status</option>
                <option value="confirmed">Confirmados</option>
                <option value="pending">Pendentes</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {sortedDays.length === 0 ? (
          <div className="text-center py-20">
            <CalendarIcon size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum agendamento encontrado para esta semana</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDays.map(date => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </h2>
                <div className="space-y-4">
                  {weeklyAppointments[date].map((appointment) => {
                    const service = services.find(s => s.id === appointment.servico_id);
                    const professional = professionals.find(p => p.id === appointment.profissional_id);
                    const client = clients.find(c => c.id === appointment.cliente_id);
                    return (
                      <button key={appointment.id} onClick={() => openViewAppointmentModal(appointment)} className="w-full border border-gray-200 rounded-lg p-4 hover:bg-gray-50 text-left transition-colors">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-4">
                              <div className="text-lg font-semibold text-gray-700">{appointment.hora_agendamento}</div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{client?.nome || 'Cliente'}</h3>
                                <p className="text-sm text-gray-600">{service?.name} • {professional?.name}</p>
                              </div>
                           </div>
                           <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                           </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

 {/* Modal Inteligente (Atualizado com Observações do Cliente) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-8 shadow-2xl my-8">
            
            {modalMode === 'view' && selectedAppointment && (
              (() => {
                const client = clients.find(c => c.id === selectedAppointment.cliente_id);
                return (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Detalhes do Agendamento</h2>
                      <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><X size={20} /></button>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700 mb-6 pb-6 border-b">
                      <p><strong>Cliente:</strong> {client?.nome}</p>
                      <p><strong>Serviço:</strong> {services.find(s => s.id === selectedAppointment.servico_id)?.name}</p>
                      <p><strong>Profissional:</strong> {professionals.find(p => p.id === selectedAppointment.profissional_id)?.name}</p>
                      <p><strong>Data:</strong> {new Date(selectedAppointment.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                      <p><strong>Hora:</strong> {selectedAppointment.hora_agendamento}</p>
                      <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedAppointment.status)}`}>{getStatusText(selectedAppointment.status)}</span></p>
                    </div>

                    {/* --- 1. EXIBIÇÃO DAS OBSERVAÇÕES DO CLIENTE (READ-ONLY) --- */}
                    {client?.observacoes && (
                      <div className="mb-6 pb-6 border-b">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                          <Info size={16} className="text-blue-600"/>
                          <span>Observações Permanentes do Cliente</span>
                        </label>
                        <div className="w-full p-3 border bg-gray-50 border-gray-200 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">
                          {client.observacoes}
                        </div>
                      </div>
                    )}

                    <div className="mb-6 pb-6 border-b">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Observações deste Agendamento</label>
                      <textarea
                        value={appointmentNotes}
                        onChange={(e) => setAppointmentNotes(e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                        placeholder="Adicione detalhes sobre o atendimento, preferências do cliente, etc..."
                      />
                      <div className="flex justify-end mt-3">
                        <button onClick={handleSaveNotes} className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                          <Save size={16}/>
                          <span>Salvar Observações</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                      {selectedAppointment.status === 'pending' && (
                        <button onClick={() => { confirmAppointment(selectedAppointment.id); setIsModalOpen(false); }} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Confirmar Agendamento</button>
                      )}
                      {selectedAppointment.status === 'confirmed' && (
                        <button onClick={() => { markAppointmentAsCompleted(selectedAppointment.id); setIsModalOpen(false); }} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Marcar como Concluído</button>
                      )}
                      {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                        <button onClick={() => { if(window.confirm('Tem certeza que deseja cancelar este agendamento?')) { cancelAppointment(selectedAppointment.id); setIsModalOpen(false); } }} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Cancelar Agendamento</button>
                      )}
                      <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">Fechar</button>
                    </div>
                  </div>
                )
              })()
            )}
            
            {modalMode === 'new' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-semibold text-gray-900">Novo Agendamento Manual</h2><button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><X size={20} /></button></div>
                <h3 className="text-md font-medium text-gray-800 border-b pb-2">Dados do Cliente</h3>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Nome do Cliente *</label><input type="text" name="clientName" required value={formData.clientName} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label><input type="tel" name="clientPhone" required value={formData.clientPhone} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                </div>
                <h3 className="text-md font-medium text-gray-800 border-b pb-2 pt-4">Dados do Serviço</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Serviço *</label><select name="servico_id" required value={formData.servico_id} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="">Selecione um serviço</option>{services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Profissional *</label><select name="profissional_id" required value={formData.profissional_id} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" disabled><option value="">Selecione um serviço</option>{professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Data *</label><input type="date" name="data_agendamento" required value={formData.data_agendamento} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Hora *</label><input type="time" name="hora_agendamento" required value={formData.hora_agendamento} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Status do Pagamento *</label><select name="status_pagamento" required value={formData.status_pagamento} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="pending">Pendente</option><option value="paid">Pago</option><option value="partial">Sinal Pago</option></select></div>
                <div className="flex space-x-4 pt-6"><button type="button" onClick={() => setIsModalOpen(false)} className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">Cancelar</button><button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Confirmar Agendamento</button></div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}