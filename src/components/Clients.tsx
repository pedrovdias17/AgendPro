import React, { useState } from 'react';
import { 
  Search, User, Phone, Mail, Calendar, Filter, 
  X, Save, MessageSquare, ChevronRight, MoreHorizontal 
} from 'lucide-react';
import { useData, Client } from '../contexts/DataContext';

export default function Clients() {
  const { clients, updateClientNotes } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nome');

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientNotes, setClientNotes] = useState('');

  const filteredClients = clients.filter(client =>
    (client.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (client.telefone || '').includes(searchTerm) ||
    (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case 'nome': return (a.nome || '').localeCompare(b.nome || '');
      case 'total_agendamentos': return (b.total_agendamentos || 0) - (a.total_agendamentos || 0);
      case 'ultima_visita':
        if (!a.ultima_visita) return 1;
        if (!b.ultima_visita) return -1;
        return new Date(b.ultima_visita).getTime() - new Date(a.ultima_visita).getTime();
      default: return 0;
    }
  });
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const openClientModal = (client: Client) => {
    setSelectedClient(client);
    setClientNotes(client.observacoes || '');
    setIsClientModalOpen(true);
  };

  const handleSaveClientNotes = async () => {
    if (!selectedClient) return;
    await updateClientNotes(selectedClient.id, clientNotes);
    alert('Observações salvas com sucesso!');
  };

  // Função para abrir o WhatsApp
  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  return (
    <div className="p-4 md:p-6 pb-24">
      {/* Header Compacto */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">{clients.length} cadastrados</p>
        </div>
      </div>

      {/* Busca e Filtro Otimizados */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Nome, telefone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-600 outline-none"
          >
            <option value="nome">Ordem Alfabética</option>
            <option value="total_agendamentos">Mais Ativos</option>
            <option value="ultima_visita">Última Visita</option>
          </select>
        </div>
      </div>

      {/* Lista de Cards Compactos */}
      <div className="space-y-2">
        {sortedClients.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <User size={40} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Nenhum cliente encontrado</p>
          </div>
        ) : (
          sortedClients.map((client) => (
            <div 
              key={client.id} 
              className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0" onClick={() => openClientModal(client)}>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{client.nome}</h3>
                  <div className="flex items-center text-[11px] text-gray-500 space-x-2 mt-0.5">
                    <span className="flex items-center"><Calendar size={10} className="mr-1" /> {formatDate(client.ultima_visita)}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="font-semibold text-blue-600">{client.total_agendamentos} visitas</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-2">
                <button 
                  onClick={() => openWhatsApp(client.telefone || '')}
                  className="p-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  title="Chamar no WhatsApp"
                >
                  <MessageSquare size={18} />
                </button>
                <button 
                  onClick={() => openClientModal(client)}
                  className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-lg"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal / Bottom Sheet de Detalhes */}
      {isClientModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100]">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><User size={24} /></div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedClient.nome}</h2>
                  <p className="text-xs text-gray-500">Cadastrado no AgendPro</p>
                </div>
              </div>
              <button onClick={() => setIsClientModalOpen(false)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100"><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Telefone</p>
                <p className="text-sm font-semibold text-gray-700">{selectedClient.telefone}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Visitas</p>
                <p className="text-sm font-semibold text-gray-700">{selectedClient.total_agendamentos} totais</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">E-mail</p>
                <p className="text-sm font-semibold text-gray-700 truncate">{selectedClient.email || 'Não informado'}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                <Save size={14} className="mr-2 text-blue-500" /> Observações Internas
              </label>
              <textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                rows={4}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Ex: Prefere atendimento pela manhã, alérgica a tal produto..."
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSaveClientNotes} 
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all"
              >
                Salvar Notas
              </button>
              <button 
                onClick={() => openWhatsApp(selectedClient.telefone || '')}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center active:scale-95 transition-all"
              >
                <MessageSquare size={18} className="mr-2" /> Chamar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}