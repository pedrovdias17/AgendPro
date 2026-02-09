import React, { useState, useEffect, FormEvent } from 'react';
import {
  User, 
  CreditCard, 
  Clock, 
  Globe,
  Save,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function FormMessage({ type, text }: { type: 'success' | 'error', text: string }) {
  const baseClasses = "text-sm p-3 rounded-lg my-4";
  const typeClasses = type === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  return <div className={`${baseClasses} ${typeClasses}`}>{text}</div>;
}

export default function Settings() {
  const { usuario, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDirty, setIsDirty] = useState(false); // Estado para detectar mudanças não salvas
  
  const [settings, setSettings] = useState({
    studioName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    customUrl: '',
    workingHours: {
      monday: { enabled: true, start: '08:00', end: '18:00', breaks: [] as {start: string, end: string}[] },
      tuesday: { enabled: true, start: '08:00', end: '18:00', breaks: [] as {start: string, end: string}[] },
      wednesday: { enabled: true, start: '08:00', end: '18:00', breaks: [] as {start: string, end: string}[] },
      thursday: { enabled: true, start: '08:00', end: '18:00', breaks: [] as {start: string, end: string}[] },
      friday: { enabled: true, start: '08:00', end: '18:00', breaks: [] as {start: string, end: string}[] },
      saturday: { enabled: false, start: '09:00', end: '13:00', breaks: [] as {start: string, end: string}[] },
      sunday: { enabled: false, start: '09:00', end: '13:00', breaks: [] as {start: string, end: string}[] }
    },
    blockedDates: [] as {date: string, profissional_id: string, motivo?: string}[],
    paymentKey: '',
    bookingSettings: {
      allowCancellation: true,
      cancellationHours: 24
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (usuario) {
      setSettings(prev => ({
        ...prev,
        studioName: usuario.nome_do_negocio || '',
        ownerName: usuario.nome || '',
        email: usuario.email || '',
        phone: usuario.telefone || '',
        address: usuario.endereco || '',
        customUrl: usuario.slug || '',
        workingHours: usuario.configuracoes?.workingHours || prev.workingHours,
        blockedDates: usuario.configuracoes?.blockedDates || [],
        paymentKey: '',
        bookingSettings: usuario.configuracoes?.bookingSettings || prev.bookingSettings,
      }));
      setIsDirty(false); // Reseta o estado ao carregar do banco
    }
  }, [usuario]);

  const fullPublicUrl = `https://agend-pro.com/booking/${settings.customUrl}`;

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'availability', label: 'Disponibilidade', icon: Clock },
    { id: 'blockedTimes', label: 'Bloqueios de Horário', icon: Clock },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'public', label: 'Página Pública', icon: Globe },
    { id: 'legal', label: 'Termos e Privacidade', icon: FileText }
  ];

  const handleSave = async () => {
    if (!usuario) return;
    setIsSaving(true);
    setMessage(null);

    try {
      if (settings.paymentKey) {
        await supabase.functions.invoke('save-secret', {
          body: { name: `mercado_pago_key_${usuario.id}`, secret: settings.paymentKey }
        });
      }

      // CORREÇÃO: Usando 'nome_do_negocio' para bater com o banco e o PublicBooking
      const profileDataToUpdate = {
        nome_do_negocio: settings.studioName, 
        nome: settings.ownerName,
        telefone: settings.phone,
        endereco: settings.address,
        slug: settings.customUrl,
        configuracoes: {
          workingHours: settings.workingHours,
          blockedDates: settings.blockedDates,
          bookingSettings: settings.bookingSettings
        }
      };
      
      const result = await updateProfile(profileDataToUpdate);

      if (!result.success) throw new Error(result.error || 'Erro ao salvar perfil.');

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setSettings(prev => ({ ...prev, paymentKey: '' }));
      setIsDirty(false); // Sucesso! Removemos o aviso de pendência

    } catch (error: any) {
      setMessage({ type: 'error', text: `Erro: ${error.message}` });
    } finally {
      setTimeout(() => setMessage(null), 5000);
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copiado!');
  };

  const weekDays = [
    { id: 'monday', label: 'Segunda-feira' }, { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' }, { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' }, { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
  ];

  const addBreak = (dayId: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [dayId]: {
          ...prev.workingHours[dayId as keyof typeof prev.workingHours],
          breaks: [...(prev.workingHours[dayId as keyof typeof prev.workingHours].breaks || []), { start: '12:00', end: '13:00' }]
        }
      }
    }));
    setIsDirty(true);
  };

  const removeBreak = (dayId: string, breakIndex: number) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [dayId]: {
          ...prev.workingHours[dayId as keyof typeof prev.workingHours],
          breaks: (prev.workingHours[dayId as keyof typeof prev.workingHours].breaks || []).filter((_, i) => i !== breakIndex)
        }
      }
    }));
    setIsDirty(true);
  };

  const copyScheduleToOtherDays = (sourceDay: string) => {
    const sourceSchedule = settings.workingHours[sourceDay as keyof typeof settings.workingHours];
    const newWorkingHours = { ...settings.workingHours };
    Object.keys(newWorkingHours).forEach(day => {
      if (day !== sourceDay && day !== 'saturday' && day !== 'sunday') {
        newWorkingHours[day as keyof typeof newWorkingHours] = { ...sourceSchedule };
      }
    });
    setSettings(prev => ({ ...prev, workingHours: newWorkingHours }));
    setIsDirty(true);
  };
  
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');

  const handleAddBlock = (date: string, reason: string) => {
    if (date) {
      const newBlock = { date: date, profissional_id: usuario?.id || '', motivo: reason || undefined };
      setSettings(prev => ({
        ...prev,
        blockedDates: [...prev.blockedDates, newBlock].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }));
      setIsDirty(true);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie seu estúdio</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
          <Save size={20} />
          <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {/* BANNER DE AVISO: Só aparece se houver alterações não salvas */}
      {isDirty && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center">
            <Sparkles className="text-amber-500 mr-3" size={20} />
            <p className="text-sm text-amber-800 font-bold">
              Você tem alterações pendentes! Não esqueça de clicar em "Salvar Alterações".
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <tab.icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
            {message && <FormMessage type={message.type} text={message.text} />}

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Nome do Negócio</label><input type="text" value={settings.studioName} onChange={(e) => {setSettings(prev => ({ ...prev, studioName: e.target.value })); setIsDirty(true);}} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Nome do Proprietário</label><input type="text" value={settings.ownerName} onChange={(e) => {setSettings(prev => ({ ...prev, ownerName: e.target.value })); setIsDirty(true);}} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={settings.email} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label><input type="tel" value={settings.phone} onChange={(e) => {setSettings(prev => ({ ...prev, phone: e.target.value })); setIsDirty(true);}} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label><input type="text" value={settings.address} onChange={(e) => {setSettings(prev => ({ ...prev, address: e.target.value })); setIsDirty(true);}} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL Personalizada</label>
                  <div className="flex flex-col md:flex-row">
                    <span className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-600 rounded-t-lg md:rounded-l-lg md:rounded-t-none md:border-r-0">agend-pro.vercel.app/booking/</span>
                    <input type="text" value={settings.customUrl} onChange={(e) => {setSettings(prev => ({ ...prev, customUrl: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })); setIsDirty(true);}} className="w-full px-4 py-2 border border-gray-300 rounded-b-lg md:rounded-r-lg md:rounded-b-none"/>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-6">
                {weekDays.map((day) => {
                  const dayId = day.id as keyof typeof settings.workingHours;
                  const daySchedule = settings.workingHours[dayId];
                  return (
                    <div key={day.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <input type="checkbox" checked={daySchedule.enabled} onChange={(e) => {setSettings(prev => ({...prev, workingHours: {...prev.workingHours, [day.id]: { ...daySchedule, enabled: e.target.checked }}})); setIsDirty(true);}} className="rounded border-gray-300 text-blue-600"/>
                          <h3 className="font-medium text-gray-900">{day.label}</h3>
                        </div>
                        {day.id !== 'saturday' && day.id !== 'sunday' && <button onClick={() => copyScheduleToOtherDays(day.id)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Copiar para outros dias</button>}
                      </div>
                      {daySchedule.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <input type="time" value={daySchedule.start} onChange={(e) => {setSettings(prev => ({...prev, workingHours: {...prev.workingHours, [day.id]: { ...daySchedule, start: e.target.value }}})); setIsDirty(true);}} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                          <input type="time" value={daySchedule.end} onChange={(e) => {setSettings(prev => ({...prev, workingHours: {...prev.workingHours, [day.id]: { ...daySchedule, end: e.target.value }}})); setIsDirty(true);}} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                        </div>
                      )}
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