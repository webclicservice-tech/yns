import React, { useEffect, useState } from 'react';
import { getProjects } from '../services/mockData';
import { Project, ProjectStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { Hammer, AlertCircle } from 'lucide-react';

const Workshop: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects().then(data => {
      // Filter for active workshop projects
      const active = data.filter(p => 
        [
            ProjectStatus.SentToWorkshop, 
            ProjectStatus.InProduction, 
            ProjectStatus.QualityControl, 
            ProjectStatus.Finished,
            ProjectStatus.Returned
        ].includes(p.status)
      );
      setProjects(active);
    });
  }, []);

  const groups = {
    [ProjectStatus.Returned]: projects.filter(p => p.status === ProjectStatus.Returned),
    [ProjectStatus.SentToWorkshop]: projects.filter(p => p.status === ProjectStatus.SentToWorkshop),
    [ProjectStatus.InProduction]: projects.filter(p => p.status === ProjectStatus.InProduction),
    [ProjectStatus.QualityControl]: projects.filter(p => p.status === ProjectStatus.QualityControl),
    [ProjectStatus.Finished]: projects.filter(p => p.status === ProjectStatus.Finished),
  };

  const getGroupTitle = (status: string) => {
    switch (status) {
        case ProjectStatus.Returned: return 'Retours / Urgences';
        case ProjectStatus.SentToWorkshop: return 'À Démarrer';
        case ProjectStatus.InProduction: return 'En Cours';
        case ProjectStatus.QualityControl: return 'Contrôle Qualité';
        case ProjectStatus.Finished: return 'Prêt (Atelier)';
        default: return status;
    }
  };

  const getGroupColor = (status: string) => {
    switch (status) {
        case ProjectStatus.Returned: return 'border-red-500 bg-red-100';
        case ProjectStatus.SentToWorkshop: return 'border-red-400 bg-red-50';
        case ProjectStatus.InProduction: return 'border-blue-400 bg-blue-50';
        case ProjectStatus.QualityControl: return 'border-yellow-400 bg-yellow-50';
        case ProjectStatus.Finished: return 'border-green-400 bg-green-50';
        default: return 'border-gray-200';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center space-x-3 text-gray-800">
        <Hammer size={28} />
        <h2 className="text-2xl font-bold">Atelier</h2>
      </div>

      <div className="flex-1 overflow-x-auto">
          <div className="flex gap-6 min-w-max pb-4 h-full">
            {[ProjectStatus.Returned, ProjectStatus.SentToWorkshop, ProjectStatus.InProduction, ProjectStatus.QualityControl, ProjectStatus.Finished].map((status) => (
                <div key={status} className="w-80 flex-shrink-0 flex flex-col">
                    <div className={`p-3 rounded-t-lg border-t-4 font-semibold shadow-sm mb-3 flex justify-between items-center bg-white ${getGroupColor(status)}`}>
                        <span>{getGroupTitle(status)}</span>
                        <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded-full">{groups[status].length}</span>
                    </div>
                    
                    <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                        {groups[status].length === 0 && (
                            <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                Aucun projet
                            </div>
                        )}
                        {groups[status].map(project => (
                            <div 
                                key={project.id} 
                                onClick={() => navigate(`/projects/${project.id}`)}
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-800 text-sm truncate">{project.clientName}</span>
                                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{project.orderNumber}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{project.type}</p>
                                
                                {/* Production Progress Bar if available */}
                                {project.tasks.length > 0 && (
                                    <div className="mb-3">
                                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                            <span>Progression</span>
                                            <span>{Math.round(project.tasks.reduce((acc, t) => acc + t.progress, 0) / project.tasks.length)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div 
                                                className="bg-blue-500 h-1.5 rounded-full" 
                                                style={{ width: `${Math.round(project.tasks.reduce((acc, t) => acc + t.progress, 0) / project.tasks.length)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {project.estimatedDeadline && new Date(project.estimatedDeadline) < new Date() && (
                                    <div className="flex items-center text-red-600 text-xs font-medium mt-2">
                                        <AlertCircle size={12} className="mr-1" />
                                        En retard ({new Date(project.estimatedDeadline).toLocaleDateString()})
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default Workshop;