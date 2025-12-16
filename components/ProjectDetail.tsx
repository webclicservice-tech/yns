import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, saveProject } from '../services/mockData';
import { Project, ProjectStatus, Role, Unit, Measurement, Attachment, Task } from '../types';
import { useAuth } from '../App';
import { 
  ArrowLeft, MapPin, Phone, Calendar, ClipboardList, Ruler, Image as ImageIcon, 
  Truck, CheckSquare, Download, FileText, Plus, Trash2, Upload, X, Save, Paperclip,
  ChevronDown, User, Edit3, ChevronLeft, ChevronRight, Clock, AlertCircle
} from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'details' | 'production' | 'delivery' | 'history'>('info');
  
  // UI State
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Calendar State
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // Local state for editing measurements
  const [isAddingMeasure, setIsAddingMeasure] = useState(false);
  const [newMeasure, setNewMeasure] = useState<Partial<Measurement>>({ unit: Unit.CM });
  
  // Local state for editing notes
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  // Local state for production tasks
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deliveryFileInputRef = useRef<HTMLInputElement>(null);
  const notesFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      getProjectById(id).then((p) => {
          setProject(p);
          if (p) {
              // Initialiser le calendrier sur la date la plus pertinente
              if (p.delivery?.validatedDate) {
                  setCalendarViewDate(new Date(p.delivery.validatedDate));
              } else if (p.delivery?.proposedDate) {
                  setCalendarViewDate(new Date(p.delivery.proposedDate));
              }
          }
      });
    }
  }, [id]);

  // Helper to update state AND database
  const updateProjectData = (updatedProject: Project) => {
      setProject(updatedProject);
      saveProject(updatedProject).catch(err => console.error("Erreur sauvegarde", err));
  };

  const handleStatusChange = (newStatus: ProjectStatus) => {
      if (project) {
          let comment = 'Changement de statut via le panneau d\'actions';
          
          if (newStatus === ProjectStatus.Returned) {
              const reason = window.prompt("Veuillez indiquer le motif du retour / observations :");
              if (reason === null) return; // Cancelled
              comment = reason || "Retourné sans observations spécifiques";
          }

          const updatedProject = { 
              ...project, 
              status: newStatus,
              history: [
                  ...project.history,
                  {
                      id: `h${Date.now()}`,
                      from: project.status,
                      to: newStatus,
                      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                      user: user?.name || 'Inconnu',
                      comment: comment
                  }
              ]
          };
          updateProjectData(updatedProject);
          setIsStatusModalOpen(false);
          setIsActionsMenuOpen(false);
      }
  };

  const handleAddMeasurement = () => {
      if (!newMeasure.room || !newMeasure.width || !newMeasure.height) return;
      
      const measure: Measurement = {
          id: `m${Date.now()}`,
          room: newMeasure.room,
          width: Number(newMeasure.width),
          height: Number(newMeasure.height),
          depth: newMeasure.depth ? Number(newMeasure.depth) : undefined,
          unit: newMeasure.unit || Unit.CM
      };

      if (project) {
          const updatedProject = { ...project, measurements: [...project.measurements, measure] };
          updateProjectData(updatedProject);
          setIsAddingMeasure(false);
          setNewMeasure({ unit: Unit.CM });
      }
  };

  const handleDeleteMeasurement = (mId: string) => {
      if (project) {
          const updatedProject = {
              ...project,
              measurements: project.measurements.filter(m => m.id !== mId)
          };
          updateProjectData(updatedProject);
      }
  };

  const handleAddTask = () => {
      if (!project || !newTaskTitle.trim()) return;
      
      const newTask: Task = {
          id: `t${Date.now()}`,
          title: newTaskTitle,
          status: 'todo',
          progress: 0,
          assignee: user?.name
      };

      const updatedProject = {
          ...project,
          tasks: [...project.tasks, newTask]
      };
      updateProjectData(updatedProject);
      setNewTaskTitle('');
      setIsAddingTask(false);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
      if (!project) return;
      
      const updatedTasks = project.tasks.map(t => {
          if (t.id === taskId) {
              const updatedTask = { ...t, ...updates };
              
              // Synchronisation automatique Statut <-> Progression
              if (updates.progress !== undefined) {
                  // Si on touche au curseur
                  if (updates.progress === 100) updatedTask.status = 'done';
                  else if (updates.progress === 0 && updatedTask.status !== 'blocked') updatedTask.status = 'todo';
                  else if (updates.progress > 0 && updates.progress < 100 && updatedTask.status !== 'blocked') updatedTask.status = 'in_progress';
              } 
              else if (updates.status !== undefined) {
                  // Si on change le statut manuellement via dropdown
                  if (updates.status === 'done') updatedTask.progress = 100;
                  if (updates.status === 'todo') updatedTask.progress = 0;
                  if (updates.status === 'in_progress' && updatedTask.progress === 0) updatedTask.progress = 10;
                  if (updates.status === 'in_progress' && updatedTask.progress === 100) updatedTask.progress = 90;
              }

              return updatedTask;
          }
          return t;
      });

      updateProjectData({ ...project, tasks: updatedTasks });
  };

  const handleDeleteTask = (taskId: string) => {
      if (!project) return;
      if (!window.confirm("Supprimer cette tâche ?")) return;
      
      const updatedProject = {
          ...project,
          tasks: project.tasks.filter(t => t.id !== taskId)
      };
      updateProjectData(updatedProject);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && project && user) {
          const type = file.type.includes('image') ? 'photo' : 'design_pdf';
          const newAttachment: Attachment = {
              id: `a${Date.now()}`,
              type: type,
              filename: file.name,
              url: '#', // Mock URL
              uploadedBy: user.id,
              date: new Date().toISOString().split('T')[0]
          };
          updateProjectData({
              ...project,
              attachments: [...project.attachments, newAttachment]
          });
      }
  };

  const handleDeliveryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && project && user) {
        const newAttachment: Attachment = {
            id: `ad${Date.now()}`,
            type: 'delivery_proof',
            filename: file.name,
            url: '#',
            uploadedBy: user.id,
            date: new Date().toISOString().split('T')[0]
        };
        updateProjectData({
            ...project,
            attachments: [...project.attachments, newAttachment]
        });
    }
  };

  const handleNoteFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && project && user) {
          const newAttachment: Attachment = {
              id: `an${Date.now()}`,
              type: 'note_attachment',
              filename: file.name,
              url: '#',
              uploadedBy: user.id,
              date: new Date().toISOString().split('T')[0]
          };
          updateProjectData({
              ...project,
              attachments: [...project.attachments, newAttachment]
          });
      }
  };

  const saveNotes = () => {
    if (project) {
        updateProjectData({ ...project, notes: editedNotes });
        setIsEditingNotes(false);
    }
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

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
      // Convert to Monday start: Mon=0, ..., Sun=6
      const firstDayMonStart = firstDay === 0 ? 6 : firstDay - 1;
      return { days, firstDay: firstDayMonStart };
  };

  const changeMonth = (delta: number) => {
      const newDate = new Date(calendarViewDate);
      newDate.setMonth(newDate.getMonth() + delta);
      setCalendarViewDate(newDate);
  };

  const isSameDay = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDateModalOpen(true);
  };

  const handleSetDeliveryDate = (type: 'proposed' | 'validated' | 'clear') => {
      if (!project || !selectedDate) return;
      
      // Ensure date string is local YYYY-MM-DD
      const offset = selectedDate.getTimezoneOffset();
      const localDate = new Date(selectedDate.getTime() - (offset*60*1000));
      const dateStr = localDate.toISOString().split('T')[0];

      const newDelivery = { ...(project.delivery || {}) };

      if (type === 'proposed') {
          newDelivery.proposedDate = dateStr;
      } else if (type === 'validated') {
          newDelivery.validatedDate = dateStr;
          newDelivery.validatedBy = user?.name || 'Inconnu';
      } else if (type === 'clear') {
          if (newDelivery.proposedDate === dateStr) delete newDelivery.proposedDate;
          if (newDelivery.validatedDate === dateStr) delete newDelivery.validatedDate;
      }

      updateProjectData({ ...project, delivery: newDelivery });
      setIsDateModalOpen(false);
  };

  const renderCalendar = () => {
      if (!project) return null;
      const { days, firstDay } = getDaysInMonth(calendarViewDate);
      const daysArray = Array.from({ length: days }, (_, i) => i + 1);
      const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

      const proposedDate = project.delivery?.proposedDate ? new Date(project.delivery.proposedDate) : null;
      const validatedDate = project.delivery?.validatedDate ? new Date(project.delivery.validatedDate) : null;

      const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

      return (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Calendrier de Livraison</h3>
                  <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-1">
                      <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all">
                          <ChevronLeft size={20} className="text-gray-600" />
                      </button>
                      <span className="font-medium w-32 text-center text-sm">
                          {monthNames[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
                      </span>
                      <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all">
                          <ChevronRight size={20} className="text-gray-600" />
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                          {day}
                      </div>
                  ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                  {blanksArray.map(b => <div key={`blank-${b}`} className="h-10 sm:h-14"></div>)}
                  {daysArray.map(day => {
                      const currentDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day);
                      let styles = "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md cursor-pointer";
                      let content = <span className="text-sm">{day}</span>;

                      const isProposed = proposedDate && isSameDay(currentDate, proposedDate);
                      const isValidated = validatedDate && isSameDay(currentDate, validatedDate);

                      if (isValidated) {
                          styles = "bg-green-500 text-white shadow-md ring-2 ring-green-200 cursor-pointer";
                          content = (
                              <div className="flex flex-col items-center">
                                  <span className="font-bold text-sm">{day}</span>
                                  <CheckSquare size={12} className="mt-1" />
                              </div>
                          );
                      } else if (isProposed) {
                          styles = "bg-blue-50 text-blue-600 border-2 border-dashed border-blue-300 cursor-pointer";
                          content = (
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-sm">{day}</span>
                                <Truck size={12} className="mt-1" />
                            </div>
                        );
                      }

                      return (
                          <div 
                            key={day} 
                            onClick={() => handleDayClick(currentDate)}
                            className={`h-10 sm:h-14 rounded-lg flex items-center justify-center transition-all ${styles}`}
                          >
                              {content}
                          </div>
                      );
                  })}
              </div>
              
              <div className="mt-6 flex gap-6 text-xs border-t pt-4 border-gray-100">
                  <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-50 border border-dashed border-blue-300 rounded"></div>
                      <span className="text-gray-600">Date proposée</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-gray-600">Date validée (Livraison)</span>
                  </div>
              </div>
          </div>
      );
  };

  if (!project) return <div className="p-8 text-center">Chargement...</div>;

  const photos = project.attachments.filter(a => a.type === 'photo');
  const documents = project.attachments.filter(a => a.type !== 'photo' && a.type !== 'delivery_proof' && a.type !== 'note_attachment');
  const deliveryProofs = project.attachments.filter(a => a.type === 'delivery_proof');
  const noteAttachments = project.attachments.filter(a => a.type === 'note_attachment');

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{project.clientName}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{project.orderNumber}</span>
                    <span>• {project.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                        {project.status}
                    </span>
                </div>
            </div>
        </div>
        
        <div className="flex gap-2 relative">
            <button 
                onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
            >
                Actions
                <ChevronDown size={16} />
            </button>

            {isActionsMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        <button 
                            onClick={() => setIsStatusModalOpen(true)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                            <CheckSquare size={16} className="text-gray-400" /> 
                            <span>Changer statut</span>
                        </button>
                        <button 
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-50 transition-colors"
                            onClick={() => {
                                alert("Fonctionnalité: Assigner responsable (A implementer)");
                                setIsActionsMenuOpen(false);
                            }}
                        >
                            <User size={16} className="text-gray-400" /> 
                            <span>Assigner responsable</span>
                        </button>
                        <button 
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-50 transition-colors"
                            onClick={() => {
                                setEditedNotes(project.notes || '');
                                setIsEditingNotes(true);
                                setActiveTab('details');
                                setIsActionsMenuOpen(false);
                            }}
                        >
                            <Edit3 size={16} className="text-gray-400" /> 
                            <span>Ajouter une note</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'info', label: 'Infos Client', icon: ClipboardList },
            { id: 'details', label: 'Détails & Conception', icon: Ruler },
            { id: 'production', label: 'Production', icon: CheckSquare },
            { id: 'delivery', label: 'Livraison', icon: Truck },
            { id: 'history', label: 'Suivi', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
        {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Coordonnées</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Phone className="mt-1 text-gray-400" size={20} />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Téléphone</p>
                                <p className="text-gray-900">{project.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="mt-1 text-gray-400" size={20} />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Adresse</p>
                                <p className="text-gray-900">{project.address}</p>
                                {project.gps && (
                                    <a 
                                        href={`https://maps.google.com/?q=${project.gps.lat},${project.gps.lng}`} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline mt-1 block"
                                    >
                                        Voir sur la carte
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Projet</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Date de création</p>
                            <p className="text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Responsable</p>
                            <p className="text-gray-900">{/* Would lookup name */} ID: {project.responsibleId}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Délai estimé</p>
                            <p className="text-gray-900">{project.estimatedDeadline ? new Date(project.estimatedDeadline).toLocaleDateString() : 'Non défini'}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'details' && (
            <div className="space-y-8">
                {/* Section Mesures */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Mesures</h3>
                        {(user?.role === Role.Commercial || user?.role === Role.Admin) && !isAddingMeasure && (
                            <button 
                                onClick={() => setIsAddingMeasure(true)}
                                className="text-sm flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800"
                            >
                                <Plus size={16} /> Ajouter
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pièce / Élément</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Largeur</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hauteur</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profondeur</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unité</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {project.measurements.map(m => (
                                    <tr key={m.id}>
                                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">{m.room}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{m.width}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{m.height}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{m.depth || '-'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{m.unit}</td>
                                        <td className="px-4 py-2 text-right">
                                            {(user?.role === Role.Commercial || user?.role === Role.Admin) && (
                                                <button onClick={() => handleDeleteMeasurement(m.id)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {isAddingMeasure && (
                                    <tr className="bg-blue-50">
                                        <td className="px-4 py-2">
                                            <input 
                                                autoFocus
                                                type="text" 
                                                placeholder="ex: Cuisine Mur A" 
                                                className="w-full text-sm border-gray-300 rounded p-1"
                                                value={newMeasure.room || ''}
                                                onChange={e => setNewMeasure({...newMeasure, room: e.target.value})}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="number" 
                                                className="w-20 text-sm border-gray-300 rounded p-1"
                                                value={newMeasure.width || ''}
                                                onChange={e => setNewMeasure({...newMeasure, width: Number(e.target.value)})}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="number" 
                                                className="w-20 text-sm border-gray-300 rounded p-1"
                                                value={newMeasure.height || ''}
                                                onChange={e => setNewMeasure({...newMeasure, height: Number(e.target.value)})}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="number" 
                                                className="w-20 text-sm border-gray-300 rounded p-1"
                                                value={newMeasure.depth || ''}
                                                onChange={e => setNewMeasure({...newMeasure, depth: Number(e.target.value)})}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <select 
                                                className="text-sm border-gray-300 rounded p-1"
                                                value={newMeasure.unit}
                                                onChange={e => setNewMeasure({...newMeasure, unit: e.target.value as Unit})}
                                            >
                                                <option value={Unit.CM}>cm</option>
                                                <option value={Unit.MM}>mm</option>
                                                <option value={Unit.M}>m</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-2 text-right flex justify-end gap-2">
                                            <button onClick={handleAddMeasurement} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
                                            <button onClick={() => setIsAddingMeasure(false)} className="text-gray-500 hover:text-gray-700"><X size={18} /></button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {!isAddingMeasure && project.measurements.length === 0 && (
                             <div className="p-8 text-center text-gray-500 text-sm">Aucune mesure enregistrée</div>
                        )}
                    </div>
                </div>

                {/* Section Documents & Conception */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Photos */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                            <span>Photos du Chantier</span>
                            <span className="text-xs font-normal text-gray-500">{photos.length} photos</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {photos.map(att => (
                                <div key={att.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ImageIcon className="text-gray-400" size={24} />
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                            ))}
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                            >
                                <Plus size={24} />
                                <span className="text-xs mt-1">Photo</span>
                            </button>
                        </div>
                    </div>

                    {/* Plans */}
                    <div>
                         <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                            <span>Documents & Conception</span>
                            <span className="text-xs font-normal text-gray-500">{documents.length} fichiers</span>
                        </h3>
                        <div className="space-y-3">
                            {documents.map(att => (
                                <div key={att.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div className="p-2 bg-red-50 text-red-500 rounded mr-3">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{att.filename}</p>
                                        <p className="text-xs text-gray-500">{att.date}</p>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-blue-600">
                                        <Download size={18} />
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                            >
                                <Upload size={18} className="mr-2" />
                                <span>Ajouter Plan PDF / Contrat</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                />

                {/* Notes */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                            <ClipboardList size={16}/> Notes & Détails Techniques
                        </h4>
                        {!isEditingNotes ? (
                             <button 
                                onClick={() => {
                                    setEditedNotes(project.notes || '');
                                    setIsEditingNotes(true);
                                }}
                                className="text-xs text-yellow-700 underline hover:text-yellow-900"
                            >
                                Modifier
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={saveNotes} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200 hover:bg-yellow-200">Enregistrer</button>
                                <button onClick={() => setIsEditingNotes(false)} className="text-xs text-yellow-600 hover:text-yellow-800">Annuler</button>
                            </div>
                        )}
                    </div>

                    {isEditingNotes ? (
                        <div className="space-y-3">
                            <textarea
                                className="w-full text-sm p-2 border border-yellow-200 rounded bg-white text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                rows={4}
                                value={editedNotes}
                                onChange={(e) => setEditedNotes(e.target.value)}
                                placeholder="Ajouter des notes techniques..."
                            />
                             <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => notesFileInputRef.current?.click()}
                                    className="flex items-center gap-1 text-xs text-yellow-700 hover:text-yellow-900 bg-white px-2 py-1 rounded border border-yellow-200"
                                >
                                    <Paperclip size={12} /> Joindre un fichier
                                </button>
                                <span className="text-xs text-yellow-600 italic">PDF, Images supportés</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-yellow-800 whitespace-pre-line">
                            {project.notes || "Aucune note technique pour le moment."}
                        </p>
                    )}

                    {/* Attachments List for Notes */}
                    {(noteAttachments.length > 0 || isEditingNotes) && (
                        <div className="mt-4 space-y-2">
                             {noteAttachments.length > 0 && <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Pièces jointes</p>}
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {noteAttachments.map(att => (
                                    <div key={att.id} className="flex items-center p-2 bg-white/60 border border-yellow-100 rounded text-sm">
                                        <Paperclip size={14} className="text-yellow-600 mr-2" />
                                        <span className="truncate flex-1 text-yellow-900">{att.filename}</span>
                                        <button className="text-yellow-600 hover:text-yellow-800 p-1"><Download size={14}/></button>
                                         {isEditingNotes && (
                                            <button 
                                                onClick={() => {
                                                    updateProjectData({
                                                        ...project,
                                                        attachments: project.attachments.filter(a => a.id !== att.id)
                                                    });
                                                }}
                                                className="text-red-400 hover:text-red-600 p-1 ml-1"
                                            >
                                                <X size={14}/>
                                            </button>
                                        )}
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                    
                    <input 
                        type="file" 
                        ref={notesFileInputRef} 
                        className="hidden" 
                        onChange={handleNoteFileUpload} 
                    />
                </div>
            </div>
        )}

        {/* Other tabs remain similar but minimized for brevity here since focus was on Details */}
        {activeTab === 'production' && (
             <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Tâches de Production</h3>
                    {(user?.role === Role.Admin || user?.role === Role.Atelier) && (
                        <button 
                            onClick={() => setIsAddingTask(true)}
                            className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-medium hover:bg-blue-100"
                        >
                            + Nouvelle Tâche
                        </button>
                    )}
                 </div>

                 {/* New Task Input Form */}
                 {isAddingTask && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-3">
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="Titre de la tâche..."
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddTask();
                                if (e.key === 'Escape') setIsAddingTask(false);
                            }}
                        />
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setIsAddingTask(false)}
                                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleAddTask}
                                disabled={!newTaskTitle.trim()}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                 )}

                 {project.tasks.length === 0 && !isAddingTask ? (
                     <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                         Aucune tâche de production définie.
                     </div>
                 ) : (
                     <div className="space-y-3">
                         {project.tasks.map(task => (
                             <div key={task.id} className="flex items-center bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                 <div className={`w-3 h-3 rounded-full mr-4 ${
                                     task.status === 'done' ? 'bg-green-500' :
                                     task.status === 'in_progress' ? 'bg-blue-500' :
                                     task.status === 'blocked' ? 'bg-red-500' : 'bg-gray-300'
                                 }`} />
                                 <div className="flex-1">
                                     <h4 className="font-medium text-gray-900">{task.title}</h4>
                                     
                                     {/* PROGRESS BAR / SLIDER */}
                                     {(user?.role === Role.Admin || user?.role === Role.Atelier) ? (
                                        <div className="mt-2 max-w-xs flex flex-col gap-1">
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="100"
                                                step="5"
                                                value={task.progress} 
                                                onChange={(e) => handleUpdateTask(task.id, { progress: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                        </div>
                                     ) : (
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-xs">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                                        </div>
                                     )}
                                 </div>
                                 <div className="text-right text-sm text-gray-500 flex flex-col items-end gap-1">
                                     <div className="flex items-center gap-2">
                                        
                                        {/* Status Text or Dropdown */}
                                        {(user?.role === Role.Admin || user?.role === Role.Atelier) ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold w-8">{task.progress}%</span>
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleUpdateTask(task.id, { status: e.target.value as any })}
                                                    className="text-xs border border-gray-300 rounded p-1 bg-white"
                                                >
                                                    <option value="todo">À faire</option>
                                                    <option value="in_progress">En cours</option>
                                                    <option value="blocked">Bloqué</option>
                                                    <option value="done">Terminé</option>
                                                </select>
                                                <button 
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 ml-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span>{task.status === 'done' ? 'Terminé' : `${task.progress}%`}</span>
                                        )}

                                     </div>
                                     <p className="text-xs">Assigné: {task.assignee || '-'}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
        )}

        {activeTab === 'delivery' && (
            <div className="space-y-6">
                {/* Visual Calendar */}
                {renderCalendar()}

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">État Livraison</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-blue-700 mb-1">Date proposée</p>
                            <p className="font-medium text-lg">{project.delivery?.proposedDate ? new Date(project.delivery.proposedDate).toLocaleDateString() : 'Non définie'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-700 mb-1">Validation Client</p>
                            {project.delivery?.validatedDate ? (
                                <span className="inline-flex items-center text-green-700 font-medium">
                                    <CheckSquare size={16} className="mr-1"/> Validée le {new Date(project.delivery.validatedDate).toLocaleDateString()}
                                </span>
                            ) : (
                                <span className="text-yellow-600 font-medium">En attente</span>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                         <span>Preuves de livraison</span>
                         <span className="text-xs font-normal text-gray-500">{deliveryProofs.length} fichiers</span>
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                        {deliveryProofs.map(proof => (
                            <div key={proof.id} className="flex items-center p-3 bg-white border border-green-100 rounded-lg shadow-sm">
                                <div className="p-2 bg-green-50 text-green-600 rounded mr-3">
                                    <Paperclip size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{proof.filename}</p>
                                    <p className="text-xs text-gray-500">{proof.date} - par {proof.uploadedBy}</p>
                                </div>
                                <a href={proof.url} className="p-2 text-gray-400 hover:text-green-600">
                                    <Download size={18} />
                                </a>
                            </div>
                        ))}
                    </div>

                    <div 
                        onClick={() => deliveryFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer"
                    >
                        <ImageIcon className="mx-auto mb-2 text-gray-400" size={32} />
                        <p>Glisser une photo de la signature ou du bon de livraison</p>
                        <p className="text-xs mt-1 text-gray-400">Cliquez pour ajouter</p>
                    </div>
                    <input 
                        type="file" 
                        ref={deliveryFileInputRef} 
                        className="hidden" 
                        accept="image/*,.pdf"
                        onChange={handleDeliveryFileUpload} 
                    />
                </div>
            </div>
        )}

        {activeTab === 'history' && (
            <div>
                 <h3 className="text-lg font-medium text-gray-900 mb-6">Historique du projet</h3>
                 <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                    {project.history.map((event, idx) => (
                        <div key={event.id} className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                <div>
                                    <p className="font-medium text-gray-900">{event.to}</p>
                                    <p className="text-xs text-gray-500">Modifié par {event.user}</p>
                                    {event.comment && (
                                        <div className="mt-2 bg-gray-50 p-2 rounded text-sm text-gray-700 italic border border-gray-100">
                                            "{event.comment}"
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 mt-1 sm:mt-0">{event.date}</span>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        )}
      </div>

      {/* Modal Changement Statut */}
      {isStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Changer le statut</h3>
                    <button onClick={() => setIsStatusModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                  </div>
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                      <div className="space-y-1">
                          {Object.values(ProjectStatus).map(status => (
                              <button
                                  key={status}
                                  onClick={() => handleStatusChange(status)}
                                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-between ${project?.status === status ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                              >
                                  {status}
                                  {project?.status === status && <CheckSquare size={16} />}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                     <button onClick={() => setIsStatusModalOpen(false)} className="w-full py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
                  </div>
              </div>
          </div>
      )}

      {/* Modal Date Selection */}
      {isDateModalOpen && selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Calendar size={20} className="text-blue-600"/>
                        {selectedDate.toLocaleDateString()}
                    </h3>
                    <button onClick={() => setIsDateModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <button 
                        onClick={() => handleSetDeliveryDate('proposed')}
                        className="w-full flex items-center justify-between p-3 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors group"
                      >
                          <div className="flex items-center gap-3">
                              <div className="bg-white p-2 rounded-full border border-blue-100">
                                  <Truck size={18} className="text-blue-600" />
                              </div>
                              <span className="font-medium">Définir comme date Proposée</span>
                          </div>
                      </button>

                      <button 
                        onClick={() => handleSetDeliveryDate('validated')}
                        className="w-full flex items-center justify-between p-3 border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors group"
                      >
                          <div className="flex items-center gap-3">
                              <div className="bg-white p-2 rounded-full border border-green-100">
                                  <CheckSquare size={18} className="text-green-600" />
                              </div>
                              <span className="font-medium">Valider la Livraison</span>
                          </div>
                      </button>

                      <div className="pt-2 border-t border-gray-100 mt-2">
                        <button 
                            onClick={() => handleSetDeliveryDate('clear')}
                            className="w-full text-center text-sm text-gray-500 hover:text-red-500 transition-colors py-2"
                        >
                            Effacer les événements pour cette date
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ProjectDetail;