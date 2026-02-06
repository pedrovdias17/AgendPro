import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sendNewAppointmentWebhook } from '../services/notificationService';
import { 
  Scissors, MapPin, Clock, User, DollarSign, Check, Phone, Mail, Calendar 
} from 'lucide-react';
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from 'date-fns/locale/pt-BR';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('pt-BR', ptBR);

interface StudioInfo {
  name: string;
  address: string;
  phone: string;
}

interface WorkingHours {
  [key: string]: {
    enabled: boolean;
    start: string;
    end: string;
  }
}

interface Professional {
  id: string;
  name: string;
  avatar?: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  professionalId: string;
}

export default function PublicBooking() {
  const { slug } = useParams();
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
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchStudioData = async () => {
      setIsLoading(true);
      
      // 1. Busca o Dono pelo Slug
      const { data: owner, error: ownerError } = await supabase
        .from('usuarios')
        .select('id, nome_do_negocio, endereco, telefone')
        .eq('slug', slug)
        .single();

      if (ownerError || !owner) {
        setIsLoading(false);
        return;
      }

      setOwnerId(owner.id);
      setStudioInfo({
        name: owner.nome_do_negocio,
        address: owner.endereco || 'Endereço não informado',
        phone: owner.telefone || ''
      });

      // 2. Busca os Horários de Funcionamento na tabela correta
      const { data: hoursData } = await supabase
        .from('horarios_funcionamento')
        .select('*')
        .eq('usuario_id', owner.id);

      if (hoursData) {
        const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const formattedHours: WorkingHours = {};
        hoursData.forEach(h => {
          formattedHours[dayMap[h.dia_semana]] = {
            enabled: h.ativo,
            start: h.hora_inicio,
            end: h.hora_fim
          };
        });
        setWorkingHours(formattedHours);
      }

      // 3. Busca Serviços e Profissionais
      const { data: servicesData } = await supabase
        .from('servicos')
        .select('*')
        .eq('usuario_id', owner.id)
        .eq('active', true);
        
      const { data: professionalsData } = await supabase
        .from('profissionais')
        .select('*')
        .eq('usuario_id', owner.id);

      setServices(servicesData || []);
      setProfessionals(professionalsData || []);
      setIsLoading(false);
    };

    fetchStudioData();
  }, [slug]);

  // Lógica de horários disponíveis
  const timeSlots = useMemo(() => {
    if (!selectedServiceData || !selectedProfessional || !selectedDate || !workingHours) return [];
    
    const dateObj = new Date(`${selectedDate}T00:00:00`);
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayMap[dateObj.getDay()];
    const daySchedule = workingHours[dayKey];

    if (!daySchedule || !daySchedule.enabled) return [];
    
    const slots = [];
    const [startH, startM] = daySchedule.start.split(':').map(Number);
    const [endH, endM] = daySchedule.end.split(':').map(Number);
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + selectedServiceData.duration <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      const time = `${h}:${m}`;
      
      // Verifica se o horário já está ocupado
      const isOccupied = existingAppointments.some(apt => apt.time === time);
      if (!isOccupied) slots.push(time);
      
      current += 30; // Pula de 30 em 30 min
    }
    return slots;
  }, [selectedDate, selectedProfessional, workingHours, selectedServiceData, existingAppointments]);

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedProfessionalData = professionals.find(p => p.id === selectedProfessional);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) setSelectedProfessional(service.professionalId);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!clientData.name || !clientData.phone) return alert('Preencha seus dados');
    setIsSubmitting(true);
    
    try {
      const { data: clientId } = await supabase.rpc('find_or_create_client', {
        p_owner_id: ownerId, p_name: clientData.name, p_phone: clientData.phone,
        p_email: clientData.email, p_last_visit: selectedDate
      });

      const { data: newAppointment, error } = await supabase.from('agendamentos').insert({
        usuario_id: ownerId, cliente_id: clientId, servico_id: selectedService,
        profissional_id: selectedProfessional, data_agendamento: selectedDate,
        hora_agendamento: selectedTime, status: 'pending'
      }).select().single();

      if (error) throw error;
      setStep(5);
    } catch (e) {
      alert('Erro ao agendar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  if (!ownerId) return <div className="flex items-center justify-center min-h-screen">Negócio não encontrado.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-6 border-b text-center">
        <h1 className="text-2xl font-black text-gray-900">{studioInfo?.name}</h1>
        <p className="text-sm text-gray-500 font-medium">{studioInfo?.address}</p>
      </div>

      <div className="max-w-md mx-auto p-4 mt-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest mb-4">Escolha o Serviço</h2>
            {services.map(s => (
              <button key={s.id} onClick={() => handleServiceSelect(s.id)} className="w-full p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center active:scale-95 transition-all">
                <div className="text-left">
                  <p className="font-bold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{s.duration} min</p>
                </div>
                <p className="font-black text-blue-600">R$ {s.price}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-800 mb-4">Data e Horário</h2>
            <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" />
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(t => (
                  <button key={t} onClick={() => { setSelectedTime(t); setStep(4); }} className="p-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 hover:bg-blue-600 hover:text-white transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(1)} className="w-full text-gray-400 font-bold">Voltar</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-800 mb-4">Seus Dados</h2>
            <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
              <input type="text" placeholder="Seu Nome" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" />
              <input type="tel" placeholder="WhatsApp" value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" />
              <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100">
                {isSubmitting ? 'Agendando...' : 'Confirmar Horário'}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Agendado!</h2>
            <p className="text-gray-500 font-medium mt-2">Você receberá uma confirmação no WhatsApp em breve.</p>
          </div>
        )}
      </div>
    </div>
  );
}