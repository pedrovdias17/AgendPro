import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Briefcase, X } from 'lucide-react';
import { useData, Service } from '../contexts/DataContext';

export default function Services() {
  const { services, professionals, addService, updateService, deleteService } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    professionalId: '',
    duration: 60,
    price: 0,
    description: '',
    requiresSignal: false,
    signalAmount: 0
  });

  // --- FUNÇÃO handleSubmit CORRIGIDA ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Criamos um objeto explícito para garantir que estamos enviando os dados corretos
    const dataForSupabase = {
      name: formData.name,
      professionalId: formData.professionalId,
      duration: formData.duration,
      price: formData.price,
      description: formData.description,
      requiresSignal: formData.requiresSignal,
      signalAmount: formData.signalAmount,
    };

    if (editingService) {
      updateService(editingService.id, dataForSupabase);
    } else {
      // @ts-ignore
      addService(dataForSupabase);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '', professionalId: '', duration: 60, price: 0,
      description: '', requiresSignal: false, signalAmount: 0
    });
    setEditingService(null);
    setIsModalOpen(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      professionalId: service.professionalId || '',
      duration: service.duration || 60,
      price: service.price || 0,
      description: service.description || '',
      requiresSignal: service.requiresSignal || false,
      signalAmount: service.signalAmount || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      deleteService(id);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Serviços</h1>
          <p className="text-gray-600">Gerencie os serviços oferecidos</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingService(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Adicionar Serviço</span>
        </button>
      </div>

      {/* Tabela de Serviços */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Serviço</th>
                <th scope="col" className="px-6 py-3">Profissional</th>
                <th scope="col" className="px-6 py-3">Duração</th>
                <th scope="col" className="px-6 py-3">Preço</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => {
                const professional = professionals.find(p => p.id === service.professionalId);
                return (
                  <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {service.name}
                    </td>
                    <td className="px-6 py-4">{professional?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{formatDuration(service.duration)}</td>
                    <td className="px-6 py-4 font-medium text-green-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleEdit(service)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(service.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {services.length === 0 && (
          <div className="text-center py-12">
            <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum serviço cadastrado</p>
            <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
              Adicionar Primeiro Serviço
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button onClick={resetForm} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Serviço *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Corte + Lavagem"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profissional Responsável *</label>
                <select required value={formData.professionalId} onChange={(e) => setFormData(prev => ({ ...prev, professionalId: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Selecione um profissional</option>
                  {professionals.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Duração (min) *</label><input type="number" required min="15" step="15" value={formData.duration} onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$) *</label><input type="number" required min="0" step="0.01" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Descreva brevemente o que está incluso no serviço..."/>
              </div>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={formData.requiresSignal} onChange={(e) => setFormData(prev => ({ ...prev, requiresSignal: e.target.checked }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <span className="text-sm font-medium text-gray-700">Exigir pagamento de sinal para este serviço</span>
                  </label>
                </div>
                {formData.requiresSignal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor do sinal (R$)</label>
                    <input type="number" min="0" step="0.01" value={formData.signalAmount} onChange={(e) => setFormData(prev => ({ ...prev, signalAmount: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="0,00"/>
                  </div>
                )}
              </div>
              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={resetForm} className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                  {editingService ? 'Salvar Alterações' : 'Adicionar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}