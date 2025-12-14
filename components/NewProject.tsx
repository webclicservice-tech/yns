import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { createProject } from '../services/mockData';
import { ArrowLeft, Save, User, FileText, Phone, MapPin, Calendar, Type } from 'lucide-react';

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    clientName: '',
    orderNumber: '',
    phone: '',
    address: '',
    type: '',
    estimatedDeadline: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const newProject = await createProject(formData, user);
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            type="button"
        >
            <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Nouveau Projet</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        {/* Section 1: Client Info */}
        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Informations Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Client *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="clientName"
                            required
                            value={formData.clientName}
                            onChange={handleChange}
                            className="pl-9 block w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 p-2.5"
                            placeholder="ex: Amina El Fassi"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-9 block w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 p-2.5"
                            placeholder="ex: +212 6..."
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="pl-9 block w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 p-2.5"
                            placeholder="ex: Lotissement Al Andalous, Meknès"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Section 2: Project Info */}
        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2 pt-2">Détails du Projet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numéro BC *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="orderNumber"
                            required
                            value={formData.orderNumber}
                            onChange={handleChange}
                            className="pl-9 block w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 p-2.5"
                            placeholder="ex: BC-2025-XXXX"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de projet *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Type className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            name="type"
                            required
                            value={formData.type}
                            onChange={handleChange}
                            className="pl-9 block w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-white"
                        >
                            <option value="">Sélectionner un type</option>
                            <option value="Cuisine">Cuisine</option>
                            <option value="Dressing">Dressing</option>
                            <option value="Habillage murale">Habillage murale</option>
                            <option value="Bureau">Bureau</option>
                            <option value="Portes">Portes</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Délai estimé (Optionnel)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="date"
                            name="estimatedDeadline"
                            value={formData.estimatedDeadline}
                            onChange={handleChange}
                            className="pl-9 block w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 p-2.5"
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Description initiale</label>
                    <textarea
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 p-2.5"
                        placeholder="Détails importants, préférences client..."
                    />
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
                Annuler
            </button>
            <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
                <Save size={18} className="mr-2" />
                Créer le projet
            </button>
        </div>
      </form>
    </div>
  );
};

export default NewProject;
