import React, { useState } from 'react';
// Importe seu hook de autenticação para buscar o usuário e atualizar o perfil
import { useAuth } from '../contexts/AuthContext';
// Importe o supabase para salvar os dados
import { supabase } from '../lib/supabase';

// --- Função Mágica: Transforma texto em URL amigável (slug) ---
const slugify = (text: string) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '') // Remove espaços e caracteres especiais
        .replace(/^-+|-+$/g, ''); // Remove hifens no início ou fim
};

const OnboardingWizard = () => {
    const { usuario, updateProfile } = useAuth(); // Pega o usuário e a função de update do seu AuthContext

    // Controla qual tela (passo) o usuário está
    const [step, setStep] = useState(1);

    // --- Estados para guardar os dados de CADA passo ---
    const [nomeNegocio, setNomeNegocio] = useState('');
    const [linkNegocio, setLinkNegocio] = useState('');

    const [nomeServico, setNomeServico] = useState('');
    const [duracaoServico, setDuracaoServico] = useState(30);
    const [valorServico, setValorServico] = useState(0);
    const [nomeProfissional, setNomeProfissional] = useState('');

    // Interface para o tipo de horário
    interface Horario {
        dia: string;
        diaSemana: number; // 0=Dom, 1=Seg, ..., 6=Sab
        disponivel: boolean; // (Vamos usar 'disponivel' no React)
        inicio: string;      // (Vamos usar 'inicio' no React)
        fim: string;         // (Vamos usar 'fim' no React)
    }

    // Estado com os horários, já pré-preenchido com padrões da sua tabela
    const [horarios, setHorarios] = useState<Horario[]>([
        { dia: 'Segunda', diaSemana: 1, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Terça', diaSemana: 2, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Quarta', diaSemana: 3, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Quinta', diaSemana: 4, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Sexta', diaSemana: 5, disponivel: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Sábado', diaSemana: 6, disponivel: false, inicio: '08:00', fim: '12:00' }, // (Deixei Sab/Dom diferentes de propósito)
        { dia: 'Domingo', diaSemana: 0, disponivel: false, inicio: '09:00', fim: '18:00' },
    ]);

    const [isLoading, setIsLoading] = useState(false);

    // --- Funções de Navegação ---
    const proximoPasso = () => {
        setStep(step + 1); // Avança para o próximo passo
    };

    const passoAnterior = () => {
        setStep(step - 1); // Volta para o passo anterior
    };

    // Atualiza o nome e o link (slug) automaticamente
    const handleNomeNegocioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nome = e.target.value;
        setNomeNegocio(nome);
        setLinkNegocio(slugify(nome));
    };

    // Permite edição manual do link, mas ainda limpa ele
    const handleLinkNegocioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLinkNegocio(slugify(e.target.value));
    };

    // Handler para atualizar os horários
    const handleHorarioChange = (diaSemana: number, campo: 'disponivel' | 'inicio' | 'fim', valor: string | boolean) => {
        setHorarios(horariosAtuais =>
            horariosAtuais.map(h =>
                h.diaSemana === diaSemana ? { ...h, [campo]: valor } : h
            )
        );
    };

    // --- Função Final ---
    const handleSalvarTudo = async () => {
        if (!usuario) return; // Guarda de segurança

        setIsLoading(true);

        // --- 1. Salvar os dados do Negócio/Perfil (na tabela 'usuarios') ---
        const { error: profileError } = await updateProfile({
            nome_do_negocio: nomeNegocio,
            slug: linkNegocio,
            has_completed_onboarding: true // A MUDANÇA MAIS IMPORTANTE!
        });

        if (profileError) {
            console.error('Erro ao salvar perfil:', profileError);
            setIsLoading(false);
            return; // Para aqui se der erro
        }

        // --- 2. Salvar o Primeiro Profissional (na tabela 'profissionais') ---
        const { data: professionalData, error: professionalError } = await supabase
            .from('profissionais')
            .insert({
                usuario_id: usuario.id,
                name: nomeProfissional,
                email: usuario.email || '', // Podemos usar o email do dono como padrão
                phone: ''
            })
            .select('id') // Pede ao Supabase para retornar o ID do profissional criado
            .single();   // Espera exatamente 1 resultado

        if (professionalError || !professionalData) {
            console.error('Erro ao salvar profissional:', professionalError);
            setIsLoading(false);
            return; // Para aqui se der erro
        }

        const newProfessionalId = professionalData.id;

        // --- 3. Salvar o Primeiro Serviço (na tabela 'servicos') ---
        const { error: serviceError } = await supabase.from('servicos').insert({
            name: nomeServico,
            duration: duracaoServico,
            price: valorServico,
            usuario_id: usuario.id,
            professionalId: newProfessionalId, // <<< AQUI A MÁGICA!
            active: true
        });

        if (serviceError) {
            console.error('Erro ao salvar serviço:', serviceError);
            setIsLoading(false);
            return; // Para aqui se der erro
        }

        // --- 4. Salvar os Horários (na tabela 'horarios_funcionamento') ---
        const horariosParaSalvar = horarios.map(h => ({
            usuario_id: usuario.id,
            dia_semana: h.diaSemana,
            ativo: h.disponivel,
            hora_inicio: h.inicio,
            hora_fim: h.fim,
        }));

        const { error: horariosError } = await supabase
            .from('horarios_funcionamento')
            .upsert(horariosParaSalvar, {
                onConflict: 'usuario_id, dia_semana'
            });

        if (horariosError) {
            console.error('Erro ao salvar horários:', horariosError);
            setIsLoading(false);
            return; // Para aqui se der erro
        }

        // Se chegou aqui, tudo deu certo
        setIsLoading(false);

        // O App.tsx vai detectar a flag 'true' no 'usuario'
        // (que o 'updateProfile' atualizou) e vai mudar a tela.
    };
    // --- Renderização dos Passos ---
    // (Aqui é onde a UI Mobile-First / Dark Mode acontece)

    if (step === 1) {
        return (
            // Container principal: tela cheia, centralizado, com fundo
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">

                {/* Card: Fica no centro, com sombra, cantos arredondados */}
                <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800">

                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
                        Bem-vindo! Vamos começar.
                    </h2>

                    <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                        Qual o nome do seu negócio?
                    </p>

                    <div className="space-y-4">
                        {/* Input Nome do Negócio */}
                        <div>
                            <label htmlFor="nomeNegocio" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Nome do Negócio
                            </label>
                            <input
                                id="nomeNegocio"
                                type="text"
                                value={nomeNegocio}
                                onChange={handleNomeNegocioChange}
                                placeholder="Ex: Barbearia do Zé"
                                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                        </div>

                        {/* Input Link do Negócio (Slug) */}
                        <div>
                            <label htmlFor="linkNegocio" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Seu link de agendamento
                            </label>
                            <div className="flex mt-1">
                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                  agend.pro/
                </span>
                                <input
                                    id="linkNegocio"
                                    type="text"
                                    value={linkNegocio}
                                    onChange={handleLinkNegocioChange}
                                    placeholder="barbeariadoze"
                                    className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                />
                            </div>
                        </div>

                        {/* Botão de Ação */}
                        <button
                            onClick={proximoPasso}
                            disabled={!nomeNegocio || !linkNegocio} // Desabilita se os campos estiverem vazios
                            className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 2) {
        // --- NOVO STEP 2: CRIAR PROFISSIONAL ---
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800">
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
                        Quem vai atender?
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                        Adicione o seu primeiro profissional. (Pode ser você mesmo!)
                    </p>

                    <div className="space-y-4">
                        {/* Input Nome do Profissional */}
                        <div>
                            <label htmlFor="nomeProfissional" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Nome do Profissional
                            </label>
                            <input
                                id="nomeProfissional"
                                type="text"
                                value={nomeProfissional}
                                onChange={(e) => setNomeProfissional(e.target.value)}
                                placeholder="Ex: Gezão"
                                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                        </div>

                        {/* Botões de Navegação */}
                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={passoAnterior}
                                className="w-full px-4 py-3 font-bold text-gray-700 bg-gray-200 rounded-md shadow-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 dark:focus:ring-offset-gray-800"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={proximoPasso}
                                disabled={!nomeProfissional} // Desabilita se não houver nome
                                className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 3) {

        // (Este é o seu *antigo* Step 2)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800">
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
                        Configure seu primeiro serviço
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                        Este serviço será associado a <span className="font-bold">{nomeProfissional}</span>.
                    </p>

                    <div className="space-y-4">
                        {/* Input Nome do Serviço */}
                        <div>
                            <label htmlFor="nomeServico" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Nome do Serviço
                            </label>
                            <input
                                id="nomeServico"
                                type="text"
                                value={nomeServico}
                                onChange={(e) => setNomeServico(e.target.value)}
                                placeholder="Ex: Corte de Cabelo"
                                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                        </div>

                        {/* Input Duração */}
                        <div>
                            <label htmlFor="duracaoServico" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Duração (em minutos)
                            </label>
                            <select
                                id="duracaoServico"
                                value={duracaoServico}
                                onChange={(e) => setDuracaoServico(parseInt(e.target.value, 10))}
                                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            >
                                <option value={15}>15 min</option>
                                <option value={30}>30 min</option>
                                <option value={45}>45 min</option>
                                <option value={60}>1 hora</option>
                                <option value={90}>1 hora e 30 min</option>
                                <option value={120}>2 horas</option>
                            </select>
                        </div>

                        {/* Input Valor (R$) */}
                        <div>
                            <label htmlFor="valorServico" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Valor (R$) (0 para "A consultar")
                            </label>
                            <div className="flex mt-1">
                                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                  R$
                                </span>
                                <input
                                    id="valorServico"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={valorServico}
                                    onChange={(e) => setValorServico(parseFloat(e.target.value) || 0)}
                                    placeholder="50,00"
                                    className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                />
                            </div>
                        </div>

                        {/* Botões de Navegação */}
                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={passoAnterior}
                                className="w-full px-4 py-3 font-bold text-gray-700 bg-gray-200 rounded-md shadow-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 dark:focus:ring-offset-gray-800"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={proximoPasso}
                                disabled={!nomeServico} // Desabilita se não houver nome
                                className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 4) {
        // --- NOVO STEP 4: CONFIGURAR HORÁRIOS ---
        // (Este é o seu *antigo* Step 3)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-lg p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800">
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
                        Defina seus horários de trabalho
                    </h2>

                    <div className="space-y-3">
                        {horarios.map((horario) => (
                            <div key={horario.diaSemana} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-700">

                                <div className="flex items-center flex-shrink-0 mb-2 sm:mb-0">
                                    <input
                                        type="checkbox"
                                        id={`check-${horario.diaSemana}`}
                                        checked={horario.disponivel}
                                        onChange={(e) => handleHorarioChange(horario.diaSemana, 'disponivel', e.target.checked)}
                                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`check-${horario.diaSemana}`} className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-200 w-20">
                                        {horario.dia}
                                    </label>
                                </div>

                                <div className={`flex items-center space-x-2 ${horario.disponivel ? 'opacity-100' : 'opacity-50'}`}>
                                    <input
                                        type="time"
                                        value={horario.inicio}
                                        disabled={!horario.disponivel}
                                        onChange={(e) => handleHorarioChange(horario.diaSemana, 'inicio', e.target.value)}
                                        className="w-full sm:w-24 px-2 py-1 text-sm border-gray-300 rounded-md shadow-sm dark:bg-gray-600 dark:text-white dark:border-gray-500 disabled:bg-gray-200 dark:disabled:bg-gray-500"
                                    />
                                    <span className="text-gray-500 dark:text-gray-400">às</span>
                                    <input
                                        type="time"
                                        value={horario.fim}
                                        disabled={!horario.disponivel}
                                        onChange={(e) => handleHorarioChange(horario.diaSemana, 'fim', e.target.value)}
                                        className="w-full sm:w-24 px-2 py-1 text-sm border-gray-300 rounded-md shadow-sm dark:bg-gray-600 dark:text-white dark:border-gray-500 disabled:bg-gray-200 dark:disabled:bg-gray-500"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={passoAnterior}
                                className="w-full px-4 py-3 font-bold text-gray-700 bg-gray-200 rounded-md shadow-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 dark:focus:ring-offset-gray-800"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleSalvarTudo}
                                disabled={isLoading}
                                className="w-full px-4 py-3 font-bold text-white bg-green-600 rounded-md shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
                            >
                                {isLoading ? 'Salvando...' : 'Concluir Configuração'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null; // Caso de fallback
};

export default OnboardingWizard;