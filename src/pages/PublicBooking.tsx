import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Scissors, MapPin, Clock, User, Check, Calendar 
} from 'lucide-react';

// Interfaces locais para evitar dependência do DataContext
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
  const [isLoading, setIsLoading] = useState(true);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState({ name: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const BUFFER_TIME = 15;


  // 1. Busca dados iniciais do estúdio
  useEffect(() => {
    if (!slug) return;

    const fetchStudioData = async () => {
      setIsLoading(true);
      
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

      const { data: servicesData } = await supabase
        .from('servicos')
        .select('*')
        .eq('usuario_id', owner.id)
        .eq('active', true);
        
      setServices(servicesData || []);
      setIsLoading(false);
    };

    fetchStudioData();
  }, [slug]);

  // 2. Busca horários ocupados quando a data é selecionada
  useEffect(() => {
    if (!ownerId || !selectedDate) return;

    const fetchBusySlots = async () => {
      const { data } = await supabase
        .from('agendamentos')
        .select('hora_agendamento')
        .eq('usuario_id', ownerId)
        .eq('data_agendamento', selectedDate)
        .neq('status', 'cancelled');

      if (data) setBusySlots(data.map(a => a.hora_agendamento));
    };

    fetchBusySlots();
  }, [ownerId, selectedDate]);

  const selectedServiceData = services.find(s => s.id === selectedService);

  const timeSlots = useMemo(() => {
    if (!selectedServiceData || !selectedDate || !workingHours) return [];
    
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

    const totalWindow = selectedServiceData.duration + BUFFER_TIME;

    while (current + selectedServiceData.duration <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      const time = `${h}:${m}`;
      
      if (!busySlots.includes(time)) slots.push(time);
      current += totalWindow; 
    }
    return slots;
  }, [selectedDate, workingHours, selectedServiceData, busySlots]);

  const handleSubmit = async () => {
    if (!clientData.name || !clientData.phone) return alert('Preencha seus dados');
    setIsSubmitting(true);
    
    try {
      const { data: clientId } = await supabase.rpc('find_or_create_client', {
        p_owner_id: ownerId, p_name: clientData.name, p_phone: clientData.phone,
        p_email: clientData.email, p_last_visit: selectedDate
      });

      const { error } = await supabase.from('agendamentos').insert({
        usuario_id: ownerId, cliente_id: clientId, servico_id: selectedService,
        profissional_id: selectedServiceData?.professionalId, data_agendamento: selectedDate,
        hora_agendamento: selectedTime, status: 'pending'
      });

      if (error) throw error;
      setStep(5);
    } catch (e) {
      alert('Erro ao agendar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen font-bold text-blue-600">Carregando...</div>;
  if (!ownerId) return <div className="flex items-center justify-center min-h-screen">Negócio não encontrado.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-white p-6 border-b text-center">
        <h1 className="text-2xl font-black text-gray-900">{studioInfo?.name}</h1>
        <p className="text-sm text-gray-500 font-medium">{studioInfo?.address}</p>
      </div>

      <div className="max-w-md mx-auto p-4 mt-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest mb-4">Escolha o Serviço</h2>
            {services.map(s => (
              <button key={s.id} onClick={() => { setSelectedService(s.id); setStep(2); }} className="w-full p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center active:scale-95 transition-all">
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
            <h2 className="text-lg font-black text-gray-800 mb-4">Selecione a Data</h2>
            <div className="bg-white p-6 rounded-3xl shadow-sm">
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" />
              {selectedDate && (
                <div className="grid grid-cols-3 gap-2 mt-6">
                  {timeSlots.map(t => (
                    <button key={t} onClick={() => { setSelectedTime(t); setStep(4); }} className="p-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 hover:bg-blue-600 hover:text-white transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setStep(1)} className="w-full text-gray-400 font-bold">Voltar</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-800 mb-4">Seus Dados</h2>
            <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
              <input type="text" placeholder="Seu Nome" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" />
              <input type="tel" placeholder="WhatsApp (com DDD)" value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" />
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
            <h2 className="text-2xl font-black text-gray-900">Agendado com Sucesso!</h2>
            <p className="text-gray-500 font-medium mt-2">Em breve você receberá uma confirmação no Whatsapp fornecido</p>
          </div>
        )}
      </div>
    </div>
  );
}