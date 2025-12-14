import React, { useEffect, useState } from 'react';
import { getProjects } from '../services/mockData';
import { Project, ProjectStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { AlertCircle, CheckCircle, Clock, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  // KPIs
  const totalProjects = projects.length;
  const lateProjects = projects.filter(p => {
    if (!p.estimatedDeadline || p.status === ProjectStatus.Validated || p.status === ProjectStatus.Delivered) return false;
    return new Date(p.estimatedDeadline) < new Date();
  }).length;
  const deliveredThisWeek = projects.filter(p => p.status === ProjectStatus.Delivered).length; // Mock logic
  const inProduction = projects.filter(p => p.status === ProjectStatus.InProduction || p.status === ProjectStatus.SentToWorkshop).length;

  // Chart Data
  const statusCounts = projects.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(statusCounts).map(status => ({
    name: status,
    count: statusCounts[status]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Projets</p>
            <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">En Retard</p>
            <p className="text-2xl font-bold text-gray-900">{lateProjects}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">En Production</p>
            <p className="text-2xl font-bold text-gray-900">{inProduction}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Livrés (Semaine)</p>
            <p className="text-2xl font-bold text-gray-900">{deliveredThisWeek}</p>
          </div>
        </div>
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Projets par statut</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Late Projects List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center text-red-600">
             <AlertCircle size={20} className="mr-2" /> Retards Critiques
          </h3>
          <div className="space-y-4">
            {projects.filter(p => {
                 if (!p.estimatedDeadline || p.status === ProjectStatus.Validated || p.status === ProjectStatus.Delivered) return false;
                 return new Date(p.estimatedDeadline) < new Date();
            }).length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun projet en retard.</p>
            ) : (
                projects.filter(p => {
                    if (!p.estimatedDeadline || p.status === ProjectStatus.Validated || p.status === ProjectStatus.Delivered) return false;
                    return new Date(p.estimatedDeadline) < new Date();
                }).map(p => (
                <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="p-3 bg-red-50 border border-red-100 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                    <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-800">{p.clientName}</span>
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border text-gray-600">{p.orderNumber}</span>
                    </div>
                    <div className="mt-2 text-sm text-red-600 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {new Date(p.estimatedDeadline!).toLocaleDateString()}
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500 font-medium">
        Développé par Mani Younes @ 2025
      </div>
    </div>
  );
};

export default Dashboard;