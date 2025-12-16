import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/mockData';
import { User, Role } from '../types';
import { Plus, User as UserIcon, Mail, Shield, X, Save, Edit2, Trash2, Eye, EyeOff, Lock } from 'lucide-react';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: Role.Commercial
  });

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleOpenCreate = () => {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '123', role: Role.Commercial });
      setShowModalPassword(false);
      setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: user.password || '', role: user.role });
      setShowModalPassword(false);
      setIsModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
          try {
              await deleteUser(userId);
              setUsers(users.filter(u => u.id !== userId));
          } catch (error) {
              console.error("Erreur lors de la suppression", error);
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
          // Mode Édition
          const updatedUser = { ...editingUser, ...formData };
          await updateUser(updatedUser);
          setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      } else {
          // Mode Création
          const newUser = await createUser(formData);
          setUsers([...users, newUser]);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: Role.Commercial });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement", error);
    }
  };

  const getRoleColor = (role: Role) => {
      switch(role) {
          case Role.Admin: return 'bg-red-100 text-red-800';
          case Role.Commercial: return 'bg-blue-100 text-blue-800';
          case Role.Atelier: return 'bg-orange-100 text-orange-800';
          case Role.Livraison: return 'bg-green-100 text-green-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
                {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                <span className="hidden sm:inline">{showPasswords ? 'Masquer MDP' : 'Afficher MDP'}</span>
            </button>
            <button 
                onClick={handleOpenCreate}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
                <Plus size={20} />
                <span className="hidden sm:inline">Nouvel Utilisateur</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mot de passe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                            <UserIcon size={16} />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {showPasswords ? (user.password || 'N/A') : '••••••••'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                        onClick={() => handleOpenEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Modifier"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                    >
                        <Trash2 size={18} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Création / Édition Utilisateur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                  {editingUser ? 'Modifier le compte' : 'Créer un compte'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        required
                        className="pl-9 block w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 p-2.5"
                        placeholder="Prénom Nom"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        required
                        className="pl-9 block w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 p-2.5"
                        placeholder="nom@menuiserie.ma"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type={showModalPassword ? "text" : "password"}
                        required
                        className="pl-9 pr-10 block w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 p-2.5"
                        placeholder="Mot de passe"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button
                        type="button"
                        onClick={() => setShowModalPassword(!showModalPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showModalPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                        className="pl-9 block w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-white"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                    >
                        {Object.values(Role).map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-3">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
                >
                    <Save size={18} className="mr-2" />
                    {editingUser ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;