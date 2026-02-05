import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Briefcase, X, Clock, DollarSign, User, AlignLeft } from 'lucide-react';
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
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataForSupabase = {
            name: formData.name,
            professionalId: formData.professionalId,
            duration: formData.duration,
            price: formData.price,
            description: formData.description,
        };

        if (editingService) {
            // @ts-ignore
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
            description: '',
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
        <div className="p-4 md:p-6 pb-24">
            {/* Header Otimizado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Serviços</h1>
                    <p className="text-sm md:text-base text-gray-600">Configure o cardápio de serviços e preços</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-95"
                >
                    <Plus size={20} />
                    <span>Novo Serviço</span>
                </button>
            </div>

            {/* Grid de Serviços (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 py-16 text-center">
                        <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Nenhum serviço cadastrado ainda</p>
                    </div>
                ) : (
                    services.map((service) => {
                        const professional = professionals.find(p => p.id === service.professionalId);
                        return (
                            <div key={service.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:border-blue-200 transition-all">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-blue-50 p-2.5 rounded-xl">
                                            <Briefcase size={22} className="text-blue-600" />
                                        </div>
                                        <div className="flex space-x-1">
                                            <button onClick={() => handleEdit(service)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(service.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{service.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                        {service.description || 'Sem descrição cadastrada.'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-t border-gray-50">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock size={16} className="text-blue-500 mr-2" />
                                            <span>{formatDuration(service.duration)}</span>
                                        </div>
                                        <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                        <User size={14} className="mr-2" />
                                        <span className="font-medium">Responsável: {professional?.name || 'Não atribuído'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal de Serviço (Bottom Sheet no Mobile) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100]">
                    <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                                </h2>
                                <p className="text-sm text-gray-500">Configure os detalhes do serviço</p>
                            </div>
                            <button onClick={resetForm} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Nome do Serviço *</label>
                                <div className="relative">
                                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Ex: Corte de Cabelo Masculino"/>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Profissional Responsável *</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <select required value={formData.professionalId} onChange={(e) => setFormData(prev => ({ ...prev, professionalId: e.target.value }))} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                                        <option value="">Selecione um profissional</option>
                                        {professionals.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Duração (min) *</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="number" required min="15" step="15" value={formData.duration} onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"/>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Preço (R$) *</label>
                                    <div className="relative">
                                        <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="number" required min="0" step="0.01" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"/>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Descrição</label>
                                <div className="relative">
                                    <AlignLeft size={18} className="absolute left-3 top-4 text-gray-400" />
                                    <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" placeholder="O que está incluso no serviço?"/>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button type="button" onClick={resetForm} className="w-full px-4 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl order-2 sm:order-1">
                                    Cancelar
                                </button>
                                <button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 order-1 sm:order-2 active:scale-95 transition-transform">
                                    {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}