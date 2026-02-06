import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Professional, Service, Client, Appointment } from '../contexts/DataContext';
import { sendNewAppointmentWebhook } from '../services/notificationService';
import { 
  Scissors, MapPin, Clock, User, DollarSign, Check, Phone, Mail 
} from 'lucide-react';
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from 'date-fns/locale/pt-BR';
import "react-datepicker/dist/react-datepicker.css";

// REGISTRO DO IDIOMA PORTUGUÊS-BR
registerLocale('pt-BR', ptBR);

interface StudioInfo {
  name: string;
  address: string;
  phone: string;
}

// Interface para os horários de trabalho para melhor tipagem
interface WorkingHours {
  [key: string]: {
    enabled: boolean;
    start: string;
    end: string;
    breaks: { start: string; end: string }[];
  }
}

export default function PublicBooking() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [studioInfo, setStudioInfo] = useState<StudioInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState({ name: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingAppointments, setExistingAppointments] = useState<{time: string, duration: number}[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<{start: string, end: string}[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchStudioData = async () => {
      setIsLoading(true);
      
      const { data: owner, error: ownerError } = await supabase
        .from('usuarios')
        .select('id, nome_do_negocio, endereco, telefone, configuracoes')
        .eq('slug', slug)
        .single();

      if (ownerError || !owner) {
        console.error("Negócio não encontrado:", ownerError);
        setServices([]);
        setIsLoading(false);
        return;
      }

      setStudioInfo({
        name: owner.nome_do_negocio,
        address: owner.endereco || 'Endereço não informado',
        phone: owner.telefone || 'Telefone não informado'
      });
      setOwnerId(owner.id);
      
      if (owner.configuracoes) {
        if (owner.configuracoes.blockedDates) {
          const dates = owner.configuracoes.blockedDates.map((block: any) => block.date);
          setBlockedDates(dates);
        }
        if (owner.configuracoes.workingHours) {
          setWorkingHours(owner.configuracoes.workingHours);
        }
      }

      const { data: servicesData, error: servicesError } = await supabase
        .from('servicos')
        .select('*')
        .eq('usuario_id', owner.id)
        .eq('active', true);
        
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('profissionais')
        .select('*')
        .eq('usuario_id', owner.id);

      if (servicesError || professionalsError) {
        console.error("Erro ao buscar serviços ou profissionais:", servicesError || professionalsError);
      } else {
        setServices(servicesData || []);
        setProfessionals(professionalsData || []);
      }

      setIsLoading(false);
    };

    fetchStudioData();
  }, [slug]);

  const handleClientDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'name') {
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 2) processedValue = `(${digits}`;
      else if (digits.length <= 7) processedValue = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      else processedValue = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }

    setClientData(prev => ({ ...prev, [name]: processedValue }));
  };
  
  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedProfessionalData = professionals.find(p => p.id === selectedProfessional);

  useEffect(() => {
    const fetchExistingAppointments = async () => {
      if (!selectedDate || !selectedProfessional) return;
      
      setIsLoading(true);
      try {
        const { data: appointments, error: appointmentsError } = await supabase
          .from('agendamentos')
          .select('hora_agendamento, servicos(duration)')
          .eq('data_agendamento', selectedDate)
          .eq('profissional_id', selectedProfessional)
          .neq('status', 'cancelled');
        
        if (appointmentsError) throw appointmentsError;
        
        const existingSlots = appointments?.map(app => ({
          time: app.hora_agendamento,
          duration: app.servicos?.duration || 60
        })) || [];
        
        setExistingAppointments(existingSlots);
        
        const { data: blocks, error: blocksError } = await supabase
          .from('bloqueios_horario')
          .select('hora_inicio, hora_fim')
          .eq('data', selectedDate)
          .eq('profissional_id', selectedProfessional);
        
        if (blocksError) throw blocksError;
        
        setTimeBlocks(blocks?.map(block => ({
          start: block.hora_inicio,
          end: block.hora_fim
        })) || []);
        
      } catch (error) {
        console.error('Erro ao buscar horários ocupados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExistingAppointments();
  }, [selectedDate, selectedProfessional]);

  const blockedDateObjects = useMemo(() => {
    return blockedDates.map(dateStr => new Date(`${dateStr}T00:00:00`));
  }, [blockedDates]);

  const timeSlots = useMemo(() => {
    if (blockedDates.includes(selectedDate)) {
      return [];
    }
    if (!selectedServiceData || !selectedProfessional || !selectedDate || !workingHours) {
      return [];
    }
    
    const dayIndex = new Date(`${selectedDate}T00:00:00`).getDay();
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayMap[dayIndex];
    const daySchedule = workingHours[dayKey];

    if (!daySchedule || !daySchedule.enabled) {
      return [];
    }
    
    const serviceDuration = selectedServiceData.duration || 60;
    const bufferTime = 15;
    const totalSlotDuration = serviceDuration + bufferTime;

    const [startH, startM] = daySchedule.start.split(':').map(Number);
    const workDayStart = startH * 60 + startM;
    const [endH, endM] = daySchedule.end.split(':').map(Number);
    const workDayEnd = endH * 60 + endM;

    const occupiedSlots = [
      ...existingAppointments.map(app => {
        const [hours, minutes] = app.time.split(':').map(Number);
        const start = hours * 60 + minutes;
        const existingAppointmentDuration = (app.duration && typeof app.duration === 'number') ? app.duration : 60;
        const end = start + existingAppointmentDuration + bufferTime;
        return { start, end };
      }),
      ...timeBlocks.map(block => {
        const [startHours, startMinutes] = block.start.split(':').map(Number);
        const [endHours, endMinutes] = block.end.split(':').map(Number);
        return { start: startHours * 60 + startMinutes, end: endHours * 60 + endMinutes };
      }),
      ...(daySchedule.breaks || []).map(breakItem => {
        const [breakStartH, breakStartM] = breakItem.start.split(':').map(Number);
        const [breakEndH, breakEndM] = breakItem.end.split(':').map(Number);
        return { 
          start: breakStartH * 60 + breakStartM, 
          end: breakEndH * 60 + breakEndM 
        };
      })
    ].sort((a, b) => a.start - b.start);

    const availableSlots = [];
    let currentTime = workDayStart;

    while (currentTime + serviceDuration <= workDayEnd) {
      const slotStart = currentTime;
      const slotEnd = currentTime + serviceDuration;
      let overlappingBlock = null;

      for (const occupied of occupiedSlots) {
        if (slotStart < occupied.end && slotEnd > occupied.start) {
          overlappingBlock = occupied;
          break;
        }
      }

      if (overlappingBlock) {
        currentTime = overlappingBlock.end;
      } else {
        const hours = Math.floor(currentTime / 60).toString().padStart(2, '0');
        const minutes = (currentTime % 60).toString().padStart(2, '0');
        availableSlots.push(`${hours}:${minutes}`);
        currentTime += totalSlotDuration;
      }
    }

    return availableSlots;
  }, [selectedDate, selectedProfessional, existingAppointments, timeBlocks, selectedServiceData, blockedDates, workingHours]);

  const availableProfessionals = (() => {
    if (!selectedService) return professionals;
    const service = services.find(s => s.id === selectedService);
    if (!service) return [];
    return professionals.filter(p => p.id === service.professionalId);
  })();

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) { setSelectedProfessional(service.professionalId); }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  // --- FUNÇÃO handleSubmit ATUALIZADA ---
  const handleSubmit = async () => {
    // Validação unificada
    if (!clientData.name.trim() || !clientData.phone.trim() || !clientData.email.trim()) {
      alert('Por favor, preencha todos os seus dados.');
      return;
    }

    // Validação do telefone
    const phoneDigits = clientData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert('Por favor, digite um telefone válido com DDD.');
      return;
    }

    // Validação do email
    if (!/\S+@\S+\.\S+/.test(clientData.email)) {
      alert('Por favor, digite um email válido.');
      return;
    }

    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !ownerId) {
      alert('Ocorreu um erro. Por favor, tente recomeçar o agendamento.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: clientResult, error: clientError } = await supabase.rpc('find_or_create_client', {
        p_owner_id: ownerId, p_name: clientData.name, p_phone: clientData.phone,
        p_email: clientData.email, p_last_visit: selectedDate
      });
      if(clientError) throw clientError;

      const clientId = clientResult;
      
      const appointmentData = {
        usuario_id: ownerId, cliente_id: clientId, servico_id: selectedService,
        profissional_id: selectedProfessional, data_agendamento: selectedDate,
        hora_agendamento: selectedTime, status: 'pending' as 'pending',
        status_pagamento: (selectedServiceData?.requiresSignal ? 'pending' : 'paid') as 'pending' | 'paid',
        valor_sinal: selectedServiceData?.requiresSignal ? selectedServiceData.signalAmount : 0,
        valor_total: selectedServiceData?.price || 0
      };

      const { data: newAppointment, error: appointmentError } = await supabase
        .from('agendamentos').insert(appointmentData).select().single();
      if(appointmentError) throw appointmentError;
      
      if (newAppointment) {
        const clientRecordForWebhook: Client = {
          id: clientId, usuario_id: ownerId!, nome: clientData.name,
          telefone: clientData.phone, email: clientData.email,
          total_agendamentos: 1, ultima_visita: selectedDate
        };
        
        sendNewAppointmentWebhook({
          newAppointment: newAppointment as Appointment,
          clientRecord: clientRecordForWebhook,
          serviceDetails: selectedServiceData,
          professionalDetails: selectedProfessionalData,
          user: { id: ownerId! } as any
        });
      }
      
      setStep(5);
    } catch (error: any) {
      console.error('Falha ao criar agendamento:', error);
      alert(`Erro ao criar agendamento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando informações do negócio...</div>;
  }
  
  if (!isLoading && (!services || services.length === 0)) {
    return <div className="min-h-screen flex items-center justify-center p-4 text-center">Este negócio não foi encontrado ou não tem serviços disponíveis.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="Logo AgendPro" className="w-24" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{studioInfo?.name}</h1>
              <p className="text-sm text-gray-600">{studioInfo?.address}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>Serviço</span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>Profissional</span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : ''}>Data & Hora</span>
            <span className={step >= 4 ? 'text-blue-600 font-medium' : ''}>Seus Dados</span>
            <span className={step >= 5 ? 'text-blue-600 font-medium' : ''}>Confirmação</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {step === 1 && ( 
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Escolha seu serviço</h2>
              <div className="space-y-4">
                {services.map((service) => (
                    <button key={service.id} onClick={() => handleServiceSelect(service.id)} className={`w-full p-4 border rounded-lg text-left transition-colors ${selectedService === service.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        <span className="font-semibold text-green-600 text-lg">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={handleNext} disabled={!selectedService} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">Continuar</button>
              </div>
            </div> 
          )}

          {step === 2 && (
             <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Escolha o profissional</h2>
              <div className="space-y-4">
                {availableProfessionals.map((professional) => (
                  <button key={professional.id} onClick={() => setSelectedProfessional(professional.id)} className={`w-full p-4 border rounded-lg text-left transition-colors ${selectedProfessional === professional.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <h3 className="font-medium text-gray-900">{professional.name}</h3>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Voltar</button>
                <button onClick={handleNext} disabled={!selectedProfessional} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">Continuar</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Escolha data e horário</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                  <DatePicker
                    locale="pt-BR"
                    selected={selectedDate ? new Date(`${selectedDate}T00:00:00`) : null}
                    onChange={(date: Date | null) => {
                      setSelectedDate(date ? date.toISOString().split('T')[0] : '');
                    }}
                    minDate={new Date()}
                    excludeDates={blockedDateObjects}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholderText="Escolha uma data"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                  <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} disabled={!selectedDate} className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100">
                    <option value="">{selectedDate ? 'Selecione um horário' : 'Escolha uma data primeiro'}</option>
                    {timeSlots.map((time) => (<option key={time} value={time}>{time}</option>))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Voltar</button>
                <button onClick={handleNext} disabled={!selectedDate || !selectedTime} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">Continuar</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Seus dados</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                  <input name="name" type="text" required value={clientData.name} onChange={handleClientDataChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Digite seu nome aqui"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <input name="phone" type="tel" required value={clientData.phone} onChange={handleClientDataChange} maxLength={15} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="(11) 99999-9999"/>
                </div>
                {/* --- CAMPO DE EMAIL ATUALIZADO --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input name="email" type="email" required value={clientData.email} onChange={handleClientDataChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="seu@email.com"/>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Voltar</button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Criando...' : 'Confirmar Agendamento'}</button>
              </div>
            </div>
          )}

          {step >= 5 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} /></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Agendamento Confirmado!</h2>
              <p className="text-gray-600 mb-6">Seu agendamento foi criado com sucesso. Você receberá uma notificação em breve.</p>
              <div className="p-4 bg-green-50 rounded-lg mb-6">
                 <h3 className="font-medium text-green-900 mb-2">Detalhes do Agendamento</h3>
                 <div className="text-sm text-green-800 space-y-1">
                   <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                   <p><strong>Horário:</strong> {selectedTime}</p>
                   <p><strong>Serviço:</strong> {selectedServiceData?.name}</p>
                   <p><strong>Profissional:</strong> {selectedProfessionalData?.name}</p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}