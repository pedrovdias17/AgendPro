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
  Info,
  MessageSquare,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useData, Appointment } from '../contexts/DataContext';

// --- HELPERS DE DATA ---
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
    appointments, services, professionals, clients, 
    confirmAppointment, markAppointmentAsCompleted, cancelAppointment, 
    updateAppointmentNotes, addAppointment 
  } = useData();

  // --- ESTADOS ---
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProfessional, setFilterProfessional] = useState('all');
  
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

  // --- LÓGICA DE WHATSAPP ---
  const handleConfirmAndNotify = async (appointment: Appointment) => {
    // 1. Atualiza no Banco
    await confirmAppointment(appointment.id);
    
    // 2. Monta o link do WhatsApp
    const client = clients.find(c => c.id === appointment.cliente_id);
    const service = services.find(s => s.id === appointment.servico_id);
    const dateFormatted = new Date(appointment.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR');
    
    if (client?.telefone) {
      const cleanPhone = client.telefone.replace(/\D/g, '');
      const message = encodeURIComponent(
        `Olá ${client.nome}! Passando para confirmar seu agendamento de *${service?.name}* para o dia *${dateFormatted}* às *${appointment.hora_agendamento}*. Tudo certo por aí? 😊`
      );
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    }
    
    setIsModalOpen(false);
  };

  // --- CONTROLE DO MODAL ---
  const openNewAppointmentModal = () => {
    setModalMode('new');
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
    alert('Notas salvas!');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    if (name === 'servico_id') {
      const service = services.find(s => s.id === value);
      if (service) newFormData.profissional_id = service.professionalId;
    }
    setFormData(newFormData);
  };

  const handleSubmitNew = async (e: FormEvent) => {
    e.preventDefault();
    await addAppointment({ ...formData, status: 'confirmed', valor_sinal: 0, observacoes: '' });
    setIsModalOpen(false);
  };

  // --- LÓGICA DA AGENDA (WINDOW DE 7 DIAS) ---
  const appointmentsWindow = useMemo(() => {
    const startISO = formatDateToISO(currentStartDate);
    const endISO = formatDateToISO(addDays(currentStartDate, 7));

    const filtered = appointments.filter(apt => {
      const client = clients.find(c => c.id === apt.cliente_id);
      const matchesRange = apt.data_agendamento >= startISO && apt.data_agendamento <= endISO;
      const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
      const matchesProf = filterProfessional === 'all' || apt.profissional_id === filterProfessional;
      
      if (!matchesRange || !matchesStatus || !matchesProf) return false;
      if (!searchTerm) return true;
      return client?.nome.toLowerCase().includes(searchTerm.toLowerCase()) || client?.telefone?.includes(searchTerm);
    });

    const grouped = filtered.reduce((acc, apt) => {
      const d = apt.data_agendamento;
      if (!acc[d]) acc[d] = [];
      acc[d].push(apt);
      return acc;
    }, {} as Record<string, Appointment[]>);

    Object.keys(grouped).forEach(d => grouped[d].sort((a, b) => a.hora_agendamento.localeCompare(b.hora_agendamento)));
    return grouped;
  }, [appointments, clients, currentStartDate, filterStatus, searchTerm, filterProfessional]);

  const sortedDays = Object.keys(appointmentsWindow).sort();

  return (
    <div className="p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500">Fluxo dos próximos 7 dias</p>
        </div>
        <button onClick={openNewAppointmentModal} className="w-full sm:w-auto bg-blue-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg shadow-blue-100">
          <Plus size={20} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Navegação e Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentStartDate(addDays(currentStartDate, -7))} className="p-2.5 bg-gray-50 rounded-xl text-gray-600 active:bg-gray-100"><ChevronLeft size={20}/></button>
          <div className="text-center">
            <span className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Exibindo de</span>
            <span className="text-sm font-bold text-gray-800">
              {currentStartDate.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})} até {addDays(currentStartDate, 7).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
            </span>
          </div>
          <button onClick={() => setCurrentStartDate(addDays(currentStartDate, 7))} className="p-2.5 bg-gray-50 rounded-xl text-gray-600 active:bg-gray-100"><ChevronRight size={20}/></button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
             <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-gray-50 border-none rounded-lg px-3 py-2 text-xs font-bold text-gray-600 min-w-[120px]">
                <option value="all">Todos Status</option>
                <option value="confirmed">Confirmados</option>
                <option value="pending">Pendentes</option>
                <option value="completed">Concluídos</option>
             </select>
             <select value={filterProfessional} onChange={(e) => setFilterProfessional(e.target.value)} className="bg-gray-50 border-none rounded-lg px-3 py-2 text-xs font-bold text-gray-600 min-w-[140px]">
                <option value="all">Profissionais</option>
                {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Lista de Dias */}
      <div className="space-y-6">
        {sortedDays.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <CalendarIcon size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          sortedDays.map(date => (
            <div key={date}>
              <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2 flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
              </h2>
              <div className="space-y-2">
                {appointmentsWindow[date].map((apt) => {
                  const client = clients.find(c => c.id === apt.cliente_id);
                  const service = services.find(s => s.id === apt.servico_id);
                  return (
                    <button key={apt.id} onClick={() => openViewAppointmentModal(apt)} className="w-full bg-white border border-gray-50 rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center justify-center bg-blue-50 w-12 h-12 rounded-xl">
                          <span className="text-xs font-black text-blue-600 leading-none">{apt.hora_agendamento}</span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-gray-900 text-sm">{client?.nome || 'Cliente'}</h3>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{service?.name}</p>
                        </div>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${apt.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal / Bottom Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100]">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[95vh] overflow-y-auto">
            
            {/* MODO VISUALIZAÇÃO */}
            {modalMode === 'view' && selectedAppointment && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Detalhes</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase">Agendamento #{selectedAppointment.id.slice(0,5)}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Cliente</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{clients.find(c => c.id === selectedAppointment.cliente_id)?.nome}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Horário</p>
                    <p className="text-sm font-bold text-gray-800">{selectedAppointment.hora_agendamento}</p>
                  </div>
                  <div className="col-span-2 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                    <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Serviço Escolhido</p>
                    <p className="text-sm font-bold text-blue-900">{services.find(s => s.id === selectedAppointment.servico_id)?.name}</p>
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-1">Notas do Atendimento</label>
                  <textarea value={appointmentNotes} onChange={(e) => setAppointmentNotes(e.target.value)} rows={3} className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500" placeholder="Anote preferências ou detalhes..."/>
                  <button onClick={handleSaveNotes} className="flex items-center justify-center space-x-2 w-full py-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors">
                    <Save size={14}/> <span>Salvar Observações</span>
                  </button>
                </div>

                {/* Ações Finais */}
                <div className="flex flex-col gap-3 pt-2">
                  {selectedAppointment.status === 'pending' && (
                    <button onClick={() => handleConfirmAndNotify(selectedAppointment)} className="w-full py-4 bg-green-500 text-white rounded-2xl font-black flex items-center justify-center space-x-3 shadow-xl shadow-green-100 active:scale-95 transition-all">
                      <MessageSquare size={20} />
                      <span>Confirmar e Avisar no WhatsApp</span>
                    </button>
                  )}
                  {selectedAppointment.status === 'confirmed' && (
                    <button onClick={() => { markAppointmentAsCompleted(selectedAppointment.id); setIsModalOpen(false); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all">
                      Finalizar Atendimento
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { if(window.confirm('Cancelar este horário?')) { cancelAppointment(selectedAppointment.id); setIsModalOpen(false); } }} className="py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm flex items-center justify-center space-x-2">
                      <Trash2 size={16}/> <span>Cancelar</span>
                    </button>
                    <button onClick={() => setIsModalOpen(false)} className="py-3 bg-gray-50 text-gray-500 rounded-xl font-bold text-sm">Fechar</button>
                  </div>
                </div>
              </div>
            )}

            {/* MODO NOVO AGENDAMENTO (COMPLETO) */}
            {modalMode === 'new' && (
              <form onSubmit={handleSubmitNew} className="space-y-5">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-black text-gray-900">Novo Agendamento</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400"><X /></button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/50 rounded-2xl space-y-4 border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Informações do Cliente</p>
                    <input type="text" name="clientName" required placeholder="Nome do Cliente" value={formData.clientName} onChange={handleFormChange} className="w-full p-3 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"/>
                    <input type="tel" name="clientPhone" required placeholder="Telefone (WhatsApp)" value={formData.clientPhone} onChange={handleFormChange} className="w-full p-3 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"/>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Serviço e Horário</p>
                    <select name="servico_id" required value={formData.servico_id} onChange={handleFormChange} className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                      <option value="">Selecione o Serviço</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" name="data_agendamento" required value={formData.data_agendamento} onChange={handleFormChange} className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"/>
                      <input type="time" name="hora_agendamento" required value={formData.hora_agendamento} onChange={handleFormChange} className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"/>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all">
                    Confirmar Agendamento
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-3 text-gray-400 font-bold">Voltar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}