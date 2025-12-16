import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, getUsers } from '../services/mockData';
import { Project, ProjectStatus, User } from '../types';
import { Search, Filter, ChevronRight, Plus, User as UserIcon } from 'lucide-react';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    getProjects().then(setProjects);
    getUsers().then(setUsers);
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesResponsible = responsibleFilter === 'all' || p.responsibleId === responsibleFilter;
    
    return matchesSearch && matchesStatus && matchesResponsible;
  });

  const getResponsibleName = (id: string) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Inconnu';
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Draft: return 'bg-gray-100 text-gray-800';
      case ProjectStatus.ValidatedBC: return 'bg-blue-100 text-blue-800';
      case ProjectStatus.InProduction: return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.Finished: return 'bg-green-100 text-green-800';
      case ProjectStatus.Delivered: return 'bg-purple-100 text-purple-800';
      case ProjectStatus.Returned: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Projets</h2>
        <button 
          onClick={() => navigate('/projects/new')}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Nouveau Projet</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par client, BC..."
              className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="relative min-w-[200px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select 
                    className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 py-2 px-3 appearance-none bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tous les statuts</option>
                    {Object.values(ProjectStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="relative min-w-[200px]">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select 
                    className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 py-2 px-3 appearance-none bg-white"
                    value={responsibleFilter}
                    onChange={(e) => setResponsibleFilter(e.target.value)}
                >
                    <option value="all">Tous responsables</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client / BC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Création</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr 
                    key={project.id} 
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{project.clientName}</span>
                        <span className="text-xs text-gray-500">{project.orderNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {project.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-bold">
                            {getResponsibleName(project.responsibleId).charAt(0)}
                        </div>
                        {getResponsibleName(project.responsibleId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        aria-label="Ouvrir le projet"
                    >
                        <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredProjects.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                  Aucun projet trouvé.
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectList;