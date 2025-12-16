import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../services/mockData';
import { Project, ProjectStatus } from '../types';
import { AlertCircle, Clock, Bell, ArrowLeft } from 'lucide-react';

const Notifications: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  const now = new Date();
  // Reset time part for accurate date comparison
  now.setHours(0, 0, 0, 0);
  
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(now.getDate() + 3);

  const isActive = (p: Project) => 
    p.status !== ProjectStatus.Validated && 
    p.status !== ProjectStatus.Delivered;

  const lateProjects = projects.filter(p => {
    if (!p.estimatedDeadline || !isActive(p)) return false;
    const deadline = new Date(p.estimatedDeadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline < now;
  });

  const approachingProjects = projects.filter(p => {
    if (!p.estimatedDeadline || !isActive(p)) return false;
    const deadline = new Date(p.estimatedDeadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline >= now && deadline <= threeDaysFromNow;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
            onClick={() => navigate(-1)} 
            className="md:hidden p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
            <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-blue-600" />
            Centre de Notifications
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Late Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
             <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                <AlertCircle size={20} /> Retards Critiques
             </h3>
             <span className="bg-white text-red-600 px-2 py-1 rounded-full text-xs font-bold shadow-sm">{lateProjects.length}</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
             {lateProjects.length === 0 ? (
                 <div className="p-8 text-center text-gray-500 text-sm">Aucun projet en retard.</div>
             ) : (
                 lateProjects.map(p => (
                     <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors group">
                         <div>
                             <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{p.clientName}</p>
                             <p className="text-sm text-gray-500">{p.orderNumber} • {p.type}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-sm font-bold text-red-600">
                                {new Date(p.estimatedDeadline!).toLocaleDateString()}
                             </p>
                             <p className="text-xs text-red-400">Échéance dépassée</p>
                         </div>
                     </div>
                 ))
             )}
          </div>
        </div>

        {/* Approaching Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
             <h3 className="text-lg font-semibold text-orange-800 flex items-center gap-2">
                <Clock size={20} /> Échéances Proches (3 jours)
             </h3>
             <span className="bg-white text-orange-600 px-2 py-1 rounded-full text-xs font-bold shadow-sm">{approachingProjects.length}</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
             {approachingProjects.length === 0 ? (
                 <div className="p-8 text-center text-gray-500 text-sm">Aucune échéance proche.</div>
             ) : (
                 approachingProjects.map(p => (
                     <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors group">
                         <div>
                             <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{p.clientName}</p>
                             <p className="text-sm text-gray-500">{p.orderNumber} • {p.type}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-sm font-bold text-orange-600">
                                {new Date(p.estimatedDeadline!).toLocaleDateString()}
                             </p>
                             <p className="text-xs text-orange-400">
                                {Math.ceil((new Date(p.estimatedDeadline!).getTime() - now.getTime()) / (1000 * 3600 * 24))} jours restants
                             </p>
                         </div>
                     </div>
                 ))
             )}
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 flex items-start gap-3">
        <AlertCircle className="shrink-0 mt-0.5" size={18} />
        <p>
            Ces alertes sont basées sur la date limite estimée définie dans chaque fiche projet. 
            Les projets marqués comme "Validé (clôturé)" ou "Livré" ne génèrent pas d'alertes.
        </p>
      </div>
    </div>
  );
};

export default Notifications;