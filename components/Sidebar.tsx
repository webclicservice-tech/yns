import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Hammer, 
  LogOut, 
  User as UserIcon,
  X,
  Users,
  Bell
} from 'lucide-react';
import { User, Role, Project, ProjectStatus } from '../types';
import { getProjects } from '../services/mockData';

interface SidebarProps {
  user: User | null;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onClose, onLogout }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Check notifications periodically or on mount
    const checkNotifications = async () => {
        const projects = await getProjects();
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize today
        
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(now.getDate() + 3);

        const isActive = (p: Project) => 
            p.status !== ProjectStatus.Validated && 
            p.status !== ProjectStatus.Delivered;

        const count = projects.filter(p => {
            if (!p.estimatedDeadline || !isActive(p)) return false;
            const deadline = new Date(p.estimatedDeadline);
            deadline.setHours(0, 0, 0, 0);
            
            // Count if late (deadline < now) OR approaching (deadline <= 3 days)
            return deadline <= threeDaysFromNow; 
        }).length;
        
        setNotificationCount(count);
    };

    checkNotifications();
  }, [location.pathname]);

  if (!user) return null;

  return (
    <div className="h-full bg-slate-900 text-white flex flex-col shadow-xl">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">M</div>
            <span className="text-xl font-bold tracking-tight">Maison Guelmoussi</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="px-6 mb-8">
        <div className="flex items-center space-x-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div className="bg-slate-700 p-2 rounded-full">
                <UserIcon size={20} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <NavLink 
          to="/" 
          onClick={onClose}
          className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
        >
          <LayoutDashboard size={20} />
          <span>Tableau de bord</span>
        </NavLink>

        <NavLink 
          to="/projects" 
          onClick={onClose}
          className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
        >
          <FolderKanban size={20} />
          <span>Projets</span>
        </NavLink>

        {(user.role === Role.Admin || user.role === Role.Atelier) && (
          <NavLink 
            to="/workshop" 
            onClick={onClose}
            className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Hammer size={20} />
            <span>Atelier</span>
          </NavLink>
        )}

        <NavLink 
          to="/notifications" 
          onClick={onClose}
          className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
        >
          <div className="relative">
            <Bell size={20} />
            {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-slate-900 leading-none">
                    {notificationCount}
                </span>
            )}
          </div>
          <span>Notifications</span>
        </NavLink>

        {user.role === Role.Admin && (
          <NavLink 
            to="/users" 
            onClick={onClose}
            className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users size={20} />
            <span>Utilisateurs</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;