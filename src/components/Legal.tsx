import React, { useState } from 'react';
import { FileText, Shield, Eye, Users } from 'lucide-react';

export default function Legal() {
  const [activeTab, setActiveTab] = useState('terms');

  const tabs = [
    { id: 'terms', label: 'Termos de Uso', icon: FileText },
    { id: 'privacy', label: 'Política de Privacidade', icon: Shield }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos e Privacidade</h1>
        <p className="text-gray-600">Informações legais e políticas da plataforma</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {activeTab === 'terms' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Termos de Uso</h2>
              
              <div className="space-y-6 text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h3>
                  <p>
                    Ao acessar e usar a plataforma Beauty Agenda, você concorda em cumprir e estar vinculado aos 
                    seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, 
                    não deve usar nossos serviços.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Descrição do Serviço</h3>
                  <p>
                    O AgendPro é uma plataforma de agendamento online destinada a salões de beleza, 
                    barbearias e profissionais da área estética ou quaisquer profissionais que queiram gerenciar melhor sua agenda. Oferecemos ferramentas para:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Gerenciamento de agendamentos</li>
                    <li>Cadastro de clientes e serviços</li>
                    <li>Processamento de pagamentos de sinais</li>
                    <li>Envio de lembretes automáticos</li>
                    <li>Relatórios e análises</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Responsabilidades do Usuário</h3>
                  <p>Ao usar nossa plataforma, você se compromete a:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Fornecer informações precisas e atualizadas</li>
                    <li>Manter a confidencialidade de suas credenciais de acesso</li>
                    <li>Usar o serviço apenas para fins legítimos e comerciais</li>
                    <li>Não violar direitos de terceiros</li>
                    <li>Cumprir todas as leis e regulamentações aplicáveis</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Pagamentos e Assinaturas</h3>
                  <p>
                    Nossa plataforma opera sob modelo de assinatura mensal. Os pagamentos são processados 
                    automaticamente e você pode cancelar a qualquer momento. Não oferecemos reembolsos 
                    proporcionais, mas você manterá acesso até o final do período pago.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Limitação de Responsabilidade</h3>
                  <p>
                    O AgendPro não se responsabiliza por danos diretos, indiretos, incidentais ou 
                    consequenciais decorrentes do uso da plataforma. Nosso serviço é fornecido "como está" 
                    e "conforme disponível".
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Modificações dos Termos</h3>
                  <p>
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações 
                    entrarão em vigor imediatamente após a publicação. É sua responsabilidade revisar 
                    periodicamente estes termos.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Contato</h3>
                  <p>
                    Para dúvidas sobre estes termos, entre em contato conosco através do WhatsApp 
                    disponível na plataforma ou pelo email: contato@agendpro.com
                  </p>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Política de Privacidade</h2>
              
              <div className="space-y-6 text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Informações que Coletamos</h3>
                  <p>Coletamos as seguintes informações para fornecer nossos serviços:</p>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <Users size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Informações de Conta</h4>
                        <p className="text-sm">Nome, email, telefone e informações do estabelecimento</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Eye size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Dados de Uso</h4>
                        <p className="text-sm">Como você interage com nossa plataforma, páginas visitadas, recursos utilizados</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Shield size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Dados de Clientes</h4>
                        <p className="text-sm">Informações dos clientes que você cadastra (nome, telefone, email, histórico)</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Como Usamos suas Informações</h3>
                  <p>Utilizamos suas informações para:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Fornecer e manter nossos serviços</li>
                    <li>Processar pagamentos e transações</li>
                    <li>Enviar notificações e lembretes</li>
                    <li>Melhorar nossa plataforma</li>
                    <li>Fornecer suporte ao cliente</li>
                    <li>Cumprir obrigações legais</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Compartilhamento de Informações</h3>
                  <p>
                    Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                    exceto nas seguintes situações:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Com seu consentimento explícito</li>
                    <li>Para cumprir obrigações legais</li>
                    <li>Com provedores de serviços essenciais (pagamento, hospedagem)</li>
                    <li>Para proteger nossos direitos e segurança</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Segurança dos Dados</h3>
                  <p>
                    Implementamos medidas de segurança técnicas e organizacionais para proteger suas 
                    informações contra acesso não autorizado, alteração, divulgação ou destruição:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Criptografia SSL/TLS para transmissão de dados</li>
                    <li>Criptografia de dados sensíveis em repouso</li>
                    <li>Controles de acesso rigorosos</li>
                    <li>Monitoramento contínuo de segurança</li>
                    <li>Backups regulares e seguros</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Seus Direitos</h3>
                  <p>Você tem o direito de:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Acessar suas informações pessoais</li>
                    <li>Corrigir dados incorretos ou incompletos</li>
                    <li>Solicitar a exclusão de seus dados</li>
                    <li>Portabilidade de dados</li>
                    <li>Retirar consentimento a qualquer momento</li>
                    <li>Apresentar reclamações às autoridades competentes</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Retenção de Dados</h3>
                  <p>
                    Mantemos suas informações pelo tempo necessário para fornecer nossos serviços 
                    e cumprir obrigações legais. Após o cancelamento da conta, os dados são 
                    mantidos por até 5 anos para fins fiscais e legais, sendo então permanentemente excluídos.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies e Tecnologias Similares</h3>
                  <p>
                    Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
                    analisar o uso da plataforma e personalizar conteúdo. Você pode controlar 
                    o uso de cookies através das configurações do seu navegador.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Alterações nesta Política</h3>
                  <p>
                    Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças 
                    significativas através da plataforma ou por email. A versão mais atual 
                    estará sempre disponível aqui.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Contato</h3>
                  <p>
                    Para questões sobre privacidade ou para exercer seus direitos, entre em 
                    contato conosco:
                  </p>
                  <ul className="list-none mt-2 space-y-1">
                    <li><strong>Email:</strong> contato@agendpro.com</li>
                    <li><strong>WhatsApp:</strong> Disponível na plataforma</li>
                  </ul>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}