import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
// A importação do 'loadStripe' foi removida, pois não é mais necessária para este fluxo.
import { 
  Crown, 
  Check, 
  Calendar, 
  DollarSign, 
  Bell, 
  Shield,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';

// O ID do Preço da sua oferta de R$ 47.
const PRICE_ID = 'price_1SGZI10jIp6LpHNPujNaBzCM'; // Ex: 'price_1P9Xq...'

export default function Upgrade() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { usuario } = useAuth();

  const benefits = [
    {
      icon: Calendar,
      title: 'Agenda Online 24h',
      description: 'Seus clientes podem agendar a qualquer hora, mesmo quando você está dormindo'
    },
    {
      icon: Bell,
      title: 'Lembretes Automáticos',
      description: 'Notificações automáticas por e-mail para lembrar seus clientes dos agendamentos'
    },
    {
      icon: Users,
      title: 'CRM Completo',
      description: 'Histórico completo de clientes, preferências e agendamentos anteriores'
    },
    {
      icon: BarChart3,
      title: 'Dashboard com Métricas',
      description: 'Acompanhe os principais indicadores do seu negócio, como faturamento e agendamentos concluídos, em tempo real.'
    },
    {
      icon: Shield,
      title: 'Backup Seguro',
      description: 'Seus dados sempre protegidos e sincronizados na nuvem'
    },
    {
      icon: Clock,
      title: 'Suporte Prioritário',
      description: 'Atendimento rápido e personalizado quando você precisar'
    }
  ];

  // --- FUNÇÃO handleUpgrade ATUALIZADA E SIMPLIFICADA ---
  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    try {
      if (!usuario) {
        throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
      }

      // Chama nossa Edge Function para criar a sessão de checkout
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId: PRICE_ID,
          userId: usuario.id 
        }
      });

      if (functionError) throw functionError;
      
      // A Edge Function agora nos retorna a URL completa do checkout
      if (!data.url) {
        throw new Error("Não foi possível obter a URL de checkout do Stripe.");
      }

      // Redirecionamento simples para a URL de pagamento
      window.location.href = data.url;

    } catch (error: any) {
      console.error('Erro no processo de upgrade:', error);
      alert(`Erro: ${error.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      {/* O resto do seu JSX continua aqui, sem alterações */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <Crown size={32} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Continue economizando tempo, zerando os no-shows e tendo total controle sobre seu negócio!
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Você está testando a versão completa. Mantenha todos esses benefícios e muito mais com nossa assinatura.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Tudo que você continuará tendo acesso:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                        <p className="text-sm text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold"> M </div>
                <div>
                  <p className="font-semibold text-gray-900">Maria Silva</p>
                  <p className="text-sm text-gray-600">Salão Beleza Pura - São Paulo</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Desde que comecei a usar o AgendPro, meus no-shows caíram 90%. O pagamento automático do sinal mudou completamente meu negócio. Agora tenho mais tempo para focar no que realmente importa: meus clientes!"
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                  <Check size={16} className="mr-2" />
                  Teste Grátis Ativo
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-medium text-gray-500 line-through mr-2">R$ 67</span>
                    <span className="text-5xl font-bold text-gray-900">R$ 47</span>
                    <span className="text-xl text-gray-600 ml-1">/mês</span>
                  </div>
                  <p className="text-sm font-semibold text-yellow-600 mt-2">Oferta de Lançamento!</p>
                </div>
                <p className="text-gray-600 mb-6"> Sem taxa de setup • Cancele quando quiser </p>
                <div className="space-y-3 text-left mb-8">
                  <div className="flex items-center space-x-3"><Check size={16} className="text-green-600 flex-shrink-0" /><span className="text-sm text-gray-700">Agendamentos ilimitados</span></div>
                  <div className="flex items-center space-x-3"><Check size={16} className="text-green-600 flex-shrink-0" /><span className="text-sm text-gray-700">Clientes ilimitados</span></div>
                  <div className="flex items-center space-x-3"><Check size={16} className="text-green-600 flex-shrink-0" /><span className="text-sm text-gray-700">Lembretes automáticos</span></div>
                  <div className="flex items-center space-x-3"><Check size={16} className="text-green-600 flex-shrink-0" /><span className="text-sm text-gray-700">Pagamento de sinais</span></div>
                  <div className="flex items-center space-x-3"><Check size={16} className="text-green-600 flex-shrink-0" /><span className="text-sm text-gray-700">Suporte prioritário</span></div>
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {isProcessing ? 'Processando...' : 'Assinar Agora'}
                </button>
                <p className="text-xs text-gray-500 mt-4"> Pagamento seguro • SSL 256-bit </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><h3 className="font-semibold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h3><p className="text-sm text-gray-600">Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais.</p></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><h3 className="font-semibold text-gray-900 mb-2">Meus dados ficam seguros?</h3><p className="text-sm text-gray-600">Absolutamente! Utilizamos criptografia de nível bancário e backup automático para proteger suas informações.</p></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><h3 className="font-semibold text-gray-900 mb-2">Preciso de conhecimento técnico?</h3><p className="text-sm text-gray-600">Não! Nossa plataforma é super intuitiva. Em 5 minutos você já estará recebendo agendamentos.</p></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><h3 className="font-semibold text-gray-900 mb-2">Funciona no celular?</h3><p className="text-sm text-gray-600">Sim! Tanto você quanto seus clientes podem usar pelo celular, tablet ou computador.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}