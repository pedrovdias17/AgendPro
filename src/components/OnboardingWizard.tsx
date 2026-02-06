import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  CheckCircle2, 
  Bell, 
  MessageCircle, 
  User, 
  Scissors, 
  Clock, 
  Check 
} from 'lucide-react';

const OnboardingWizard = () => {
    const { usuario, updateProfile } = useAuth();
    
    // Começamos no Passo 1 (Profissional), pois Nome/Link já foram pegos no cadastro
    const [step, setStep] = useState(1);
    const [isFinished, setIsFinished] = useState(false); // Nova tela final

    // Estados dos dados
    const [nomeProfissional, setNomeProfissional] = useState('');
    const [nomeServico, setNomeServico] = useState('');
    const [duracaoServico, setDuracaoServico] = useState(30);
    const [valorServico, setValorServico] = useState(0);

    interface Horario {
        dia: string;
        diaSemana: number;
        disponivel: boolean;
        inicio: string;
        fim: string;
    }

    const [horarios, setHorarios] = useState<Horario[]>([
        { dia: 'Segunda', diaSemana: 1, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Terça', diaSemana: 2, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Quarta', diaSemana: 3, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Quinta', diaSemana: 4, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Sexta', diaSemana: 5, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Sábado', diaSemana: 6, disponivel: false, inicio: '08:00', fim: '12:00' },
        { dia: 'Domingo', diaSemana: 0, disponivel: false, inicio: '09:00', fim: '18:00' },
    ]);

    const [isLoading, setIsLoading] = useState(false);

    const handleHorarioChange = (diaSemana: number, campo: 'disponivel' | 'inicio' | 'fim', valor: string | boolean) => {
        setHorarios(horariosAtuais =>
            horariosAtuais.map(h => h.diaSemana === diaSemana ? { ...h, [campo]: valor } : h)
        );
    };

    const handleSalvarTudo = async () => {
        if (!usuario) return;
        setIsLoading(true);

        // 1. Apenas marca onboarding como concluído (Nome e Slug já existem)
        const { error: profileError } = await updateProfile({
            has_completed_onboarding: true
        });

        if (profileError) {
            setIsLoading(false);
            return;
        }

        // 2. Salvar Profissional
        const { data: professionalData, error: professionalError } = await supabase
            .from('profissionais')
            .insert({
                usuario_id: usuario.id,
                name: nomeProfissional,
                email: usuario.email || '',
                phone: ''
            })
            .select('id')
            .single();

        if (professionalError || !professionalData) {
            setIsLoading(false);
            return;
        }

        // 3. Salvar Serviço
        const { error: serviceError } = await supabase.from('servicos').insert({
            name: nomeServico,
            duration: duracaoServico,
            price: valorServico,
            usuario_id: usuario.id,
            professionalId: professionalData.id,
            active: true
        });

        if (serviceError) {
            setIsLoading(false);
            return;
        }

        // 4. Salvar Horários
        const { error: horariosError } = await supabase
            .from('horarios_funcionamento')
            .upsert(horarios.map(h => ({
                usuario_id: usuario.id,
                dia_semana: h.diaSemana,
                ativo: h.disponivel,
                hora_inicio: h.inicio,
                hora_fim: h.fim,
            })), { onConflict: 'usuario_id, dia_semana' });

        setIsLoading(false);
        if (!horariosError) setIsFinished(true); // Abre a tela de sucesso
    };

    // TELA FINAL DE SUCESSO
    if (isFinished) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4">Tudo pronto!</h2>
                    <p className="text-gray-500 mb-8 font-medium">Sua conta foi configurada com sucesso. Agora você já pode começar a receber agendamentos.</p>
                    
                    <div className="space-y-4 mb-8 text-left">
                        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl">
                            <Bell className="text-blue-600 mt-1" size={20} />
                            <div>
                                <p className="text-sm font-bold text-blue-900">Ative as Notificações</p>
                                <p className="text-xs text-blue-700">Lembre-se de permitir as notificações no seu navegador para não perder nenhum horário.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                            <MessageCircle className="text-gray-600 mt-1" size={20} />
                            <div>
                                <p className="text-sm font-bold text-gray-900">Precisa de ajuda?</p>
                                <p className="text-xs text-gray-500">Qualquer dúvida, basta clicar no botão de suporte no canto da tela.</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.reload()} 
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100"
                    >
                        Ir para o Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // PASSO 1: PROFISSIONAL
    if (step === 1) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-gray-900">Quem atende?</h2>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Passo 1 de 3</span>
                    </div>
                    <p className="text-gray-500 mb-6 font-medium">Adicione o seu primeiro profissional. Pode ser você mesmo!</p>
                    <div className="space-y-4">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nome do Profissional</label>
                        <input 
                            type="text" 
                            value={nomeProfissional} 
                            onChange={(e) => setNomeProfissional(e.target.value)}
                            placeholder="Ex: Gezão"
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                        />
                        <button 
                            disabled={!nomeProfissional}
                            onClick={() => setStep(2)}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 disabled:bg-gray-200"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // PASSO 2: SERVIÇO
    if (step === 2) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-gray-900">Seu serviço</h2>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Passo 2 de 3</span>
                    </div>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome do Serviço</label>
                            <input 
                                type="text" 
                                value={nomeServico} 
                                onChange={(e) => setNomeServico(e.target.value)}
                                placeholder="Ex: Corte de Cabelo"
                                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-medium"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Duração</label>
                                <select 
                                    value={duracaoServico} 
                                    onChange={(e) => setDuracaoServico(Number(e.target.value))}
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-medium"
                                >
                                    <option value={30}>30 min</option>
                                    <option value={60}>1 hora</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Valor (R$)</label>
                                <input 
                                    type="number" 
                                    value={valorServico} 
                                    onChange={(e) => setValorServico(Number(e.target.value))}
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-medium"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 font-bold">Voltar</button>
                            <button 
                                disabled={!nomeServico}
                                onClick={() => setStep(3)}
                                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // PASSO 3: HORÁRIOS
    if (step === 3) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-gray-900">Horários</h2>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Passo 3 de 3</span>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide mb-6">
                        {horarios.map((h) => (
                            <div key={h.diaSemana} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={h.disponivel} 
                                        onChange={(e) => handleHorarioChange(h.diaSemana, 'disponivel', e.target.checked)}
                                        className="w-5 h-5 rounded-lg border-none text-blue-600 focus:ring-0"
                                    />
                                    <span className="text-sm font-bold text-gray-700">{h.dia}</span>
                                </div>
                                <div className={`flex items-center gap-2 ${!h.disponivel && 'opacity-30'}`}>
                                    <input type="time" value={h.inicio} disabled={!h.disponivel} className="bg-transparent border-none text-xs font-bold text-gray-900 p-0 w-12" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase">às</span>
                                    <input type="time" value={h.fim} disabled={!h.disponivel} className="bg-transparent border-none text-xs font-bold text-gray-900 p-0 w-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setStep(2)} className="flex-1 py-4 text-gray-400 font-bold">Voltar</button>
                        <button 
                            onClick={handleSalvarTudo}
                            disabled={isLoading}
                            className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-100 disabled:bg-gray-200"
                        >
                            {isLoading ? 'Salvando...' : 'Concluir Tudo'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default OnboardingWizard;