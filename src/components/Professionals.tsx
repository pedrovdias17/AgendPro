import React, { useState } from 'react';
import { Plus, Edit2, Trash2, User, Mail, Phone, X, MoreVertical } from 'lucide-react';
import { useData, Professional } from '../contexts/DataContext';

export default function Professionals() {
  const { professionals, addProfessional, updateProfessional, deleteProfessional } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfessional) {
      updateProfessional(editingProfessional.id, formData);
    } else {
      addProfessional(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
    setEditingProfessional(null);
    setIsModalOpen(false);
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.')) {
      deleteProfessional(id);
    }
  };

  return (
    <div className="p-4 md:p-6 pb-24">
      {/* Header Otimizado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Profissionais</h1>
          <p className="text-sm md:text-base text-gray-600">Gerencie sua equipe de atendimento</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-95"
        >
          <Plus size={20} />
          <span>Novo Profissional</span>
        </button>
      </div>

      {/* Lista de Profissionais (Cards no Mobile, Tabela no Desktop) */}
      <div className="space-y-3">
        {professionals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <User size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum profissional cadastrado</p>
          </div>
        ) : (
          professionals.map((professional) => (
            <div 
              key={professional.id} 
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4"
            >
              {/* Topo do Card: Info Principal + Ações */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                    <User size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{professional.name}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                      Profissional Ativo
                    </span>
                  </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleEdit(professional)} 
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(professional.id)} 
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Divisor Interno */}
              <div className="h-px bg-gray-50 w-full" />

              {/* Rodapé do Card: Contatos em Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Mail size={16} className="text-blue-500 mr-2 shrink-0" />
                  <span className="truncate">{professional.email || 'Sem e-mail'}</span>
                </div>
                <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Phone size={16} className="text-green-500 mr-2 shrink-0" />
                  <span>{professional.phone || 'Sem telefone'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Modal Otimizado para Mobile (Abre como "Bottom Sheet" visualmente) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100]">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
                </h2>
                <p className="text-sm text-gray-500">Preencha os dados abaixo</p>
              </div>
              <button onClick={resetForm} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Nome Completo *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" 
                    placeholder="Nome do profissional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">E-mail</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" 
                    placeholder="exemplo@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" 
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="w-full px-4 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 order-1 sm:order-2 active:scale-95 transition-transform"
                >
                  {editingProfessional ? 'Salvar Alterações' : 'Cadastrar Equipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}