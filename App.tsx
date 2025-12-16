import React, { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, Role } from './types';
import { getUsers } from './services/mockData';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import NewProject from './components/NewProject';
import Workshop from './components/Workshop';
import UserList from './components/UserList';
import Notifications from './components/Notifications';
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string) => {
    // Vérification asynchrone dans la "DB" locale
    const users = await getUsers();
    const foundUser = users.find(u => u.email === email) || users[0];
    setUser(foundUser);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Layout ---
const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
            <div 
                className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
            />
        )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} onLogout={logout} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b lg:hidden flex items-center p-4">
            <button onClick={() => setSidebarOpen(true)} className="mr-4 text-gray-600">
                <Menu />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Maison Guelmoussi</h1>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- Protected Route ---
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

// --- App ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
          <Route path="/projects/new" element={<ProtectedRoute><NewProject /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/workshop" element={<ProtectedRoute><Workshop /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;