import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  CheckCircle2, 
  User, 
  Phone,
  Check,
  ChevronLeft
} from 'lucide-react';

const OnboardingWizard = () => {
    const { usuario, updateProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [isFinished, setIsFinished] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Estados dos dados
    const [whatsappDono, setWhatsappDono] = useState('');
    const [nomeProfissional, setNomeProfissional] = useState('');
    const [nomeServico, setNomeServico] = useState('');
    const [duracaoServico, setDuracaoServico] = useState(30);
    const [valorServico, setValorServico] = useState(0);

    const [horarios, setHorarios] = useState([
        { dia: 'Segunda', diaSemana: 1, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Terça', diaSemana: 2, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Quarta', diaSemana: 3, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Quinta', diaSemana: 4, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Sexta', diaSemana: 5, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Sábado', diaSemana: 6, disponivel: false, inicio: '08:00', fim: '12:00' },
        { dia: 'Domingo', diaSemana: 0, disponivel: false, inicio: '09:00', fim: '18:00' },
    ]);

    const handleHorarioChange = (diaSemana: number, campo: 'disponivel' | 'inicio' | 'fim', valor: string | boolean) => {
        setHorarios(horariosAtuais =>
            horariosAtuais.map(h => h.diaSemana === diaSemana ? { ...h, [campo]: valor } : h)
        );
    };

    const handleSalvarTudo = async () => {
        if (!usuario) return;
        setIsLoading(true);

        const { error: profileError } = await updateProfile({
            telefone: whatsappDono,
            has_completed_onboarding: true
        });

        if (profileError) {
            setIsLoading(false);
            return;
        }

        const { data: professionalData, error: professionalError } = await supabase
            .from('profissionais')
            .insert({
                usuario_id: usuario.id,
                name: nomeProfissional,
                email: usuario.email || '',
                phone: whatsappDono
            })
            .select('id')
            .single();

        if (professionalError || !professionalData) {
            setIsLoading(false);
            return;
        }

        await supabase.from('servicos').insert({
            name: nomeServico,
            duration: duracaoServico,
            price: valorServico,
            usuario_id: usuario.id,
            professionalId: professionalData.id,
            active: true
        });

        await supabase.from('horarios_funcionamento').upsert(
            horarios.map(h => ({
                usuario_id: usuario.id,
                dia_semana: h.diaSemana,
                ativo: h.disponivel,
                hora_inicio: h.inicio,
                hora_fim: h.fim,
            }))
        );

        setIsLoading(false);
        setIsFinished(true);
    };

    if (isFinished) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl text-center border border-slate-100">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Agenda Ativa! 🚀</h2>
                    <p className="text-slate-500 mb-10 font-medium">Sua conta foi configurada. Fique de olho no WhatsApp para novos avisos!</p>
                    <button onClick={() => window.location.reload()} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all">
                        Ir para o Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 font-sans text-slate-900">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                {/* CABEÇALHO COM STEPS */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black tracking-tighter">
                        {step === 1 && "Seu Contato"}
                        {step === 2 && "Seu Serviço"}
                        {step === 3 && "Sua Agenda"}
                    </h2>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                        Passo {step} de 3
                    </span>
                </div>

                {/* PASSO 1: WHATSAPP E NOME */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">WhatsApp de Alertas</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-4 text-slate-300" size={18} />
                                <input type="tel" value={whatsappDono} onChange={(e) => setWhatsappDono(e.target.value)} placeholder="11999999999" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-bold" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Profissional</label>
                            <div className="relative">
                                <User className="absolute left-4 top-4 text-slate-300" size={18} />
                                <input type="text" value={nomeProfissional} onChange={(e) => setNomeProfissional(e.target.value)} placeholder="Ex: Gezão" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-bold" />
                            </div>
                        </div>
                        <button disabled={!nomeProfissional || !whatsappDono} onClick={() => setStep(2)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 disabled:opacity-30 transition-all active:scale-95">
                            Próximo Passo
                        </button>
                    </div>
                )}

                {/* PASSO 2: SERVIÇO */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome do Serviço Principal</label>
                            <input type="text" value={nomeServico} onChange={(e) => setNomeServico(e.target.value)} placeholder="Ex: Corte de Cabelo" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Duração</label>
                                <select value={duracaoServico} onChange={(e) => setDuracaoServico(Number(e.target.value))} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold">
                                    <option value={30}>30 min</option>
                                    <option value={60}>1 hora</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Preço (R$)</label>
                                <input type="number" value={valorServico} onChange={(e) => setValorServico(Number(e.target.value))} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="flex-1 text-slate-400 font-bold">Voltar</button>
                            <button disabled={!nomeServico} onClick={() => setStep(3)} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95">
                                Próximo Passo
                            </button>
                        </div>
                    </div>
                )}

                {/* PASSO 3: HORÁRIOS */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                            {horarios.map((h) => (
                                <div key={h.diaSemana} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={h.disponivel} onChange={(e) => handleHorarioChange(h.diaSemana, 'disponivel', e.target.checked)} className="w-5 h-5 rounded-lg border-none text-blue-600" />
                                        <span className="text-sm font-black">{h.dia}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${!h.disponivel && 'opacity-20'}`}>
                                        <input type="time" value={h.inicio} className="bg-transparent border-none text-xs font-black w-12 p-0" />
                                        <span className="text-[10px] font-black text-slate-300">ÁS</span>
                                        <input type="time" value={h.fim} className="bg-transparent border-none text-xs font-black w-12 p-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(2)} className="flex-1 text-slate-400 font-bold">Voltar</button>
                            <button onClick={handleSalvarTudo} disabled={isLoading} className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-100 transition-all active:scale-95">
                                {isLoading ? 'Configurando...' : 'Concluir Tudo'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingWizard;