import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getUsers } from '../services/mockData';
import { User } from '../types';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('younes@menuiserie.ma');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Charger les utilisateurs depuis la DB locale
    getUsers().then(setAvailableUsers);
  }, []);

  React.useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(identifier);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden mb-8">
        <div className="bg-blue-600 p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Maison Guelmoussi</h1>
            <p className="text-blue-100">Gestion de production Menuiserie</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email / Téléphone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 border focus:bg-white focus:ring-blue-500 focus:border-blue-500 p-3"
                  placeholder="Email ou téléphone"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 block w-full rounded-lg border-gray-300 bg-gray-50 border focus:bg-white focus:ring-blue-500 focus:border-blue-500 p-3"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                    Mot de passe oublié ?
                </button>
              </div>
            </div>

            <div className="space-y-3">
                <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                Se connecter
                </button>
                
                <button
                type="button"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                onClick={() => window.history.back()}
                >
                Retour
                </button>
            </div>
          </form>

          <div className="mt-8">
            <p className="text-center text-xs text-gray-500 mb-3">Comptes de démonstration (cliquez pour remplir) :</p>
            <div className="grid grid-cols-2 gap-2">
              {availableUsers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setIdentifier(u.email)}
                  className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded p-2 text-left truncate transition-colors"
                >
                  <span className="font-semibold block">{u.role}</span>
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-gray-500 text-sm font-medium">
        Développé par Mani Younes @ 2025
      </div>
    </div>
  );
};

export default Login;