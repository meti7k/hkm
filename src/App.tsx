import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { Onboarding } from './pages/Onboarding';
import { MainMenu } from './pages/MainMenu';
import { Profile } from './pages/Profile';
import { Store } from './pages/Store';
import { Friends } from './pages/Friends';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { Chat } from './pages/Chat';
import { Crown } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  if (!user.isRegistered) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<ProtectedRoute><MainMenu /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
      <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
      <Route path="/chat/:friendId" element={<ProtectedRoute><Chat /></ProtectedRoute>} /> 
      <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
      <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const InnerApp = () => {
    const { isLoading } = useApp();

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 mb-8 relative">
                         <div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full animate-pulse"></div>
                         <div className="relative w-full h-full bg-gradient-to-br from-gold-400 to-amber-600 rounded-2xl rotate-45 flex items-center justify-center shadow-2xl border border-gold-300/20">
                             <Crown size={48} className="text-slate-900 -rotate-45" strokeWidth={2.5} />
                         </div>
                    </div>
                    
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-amber-500 mb-2 tracking-tight whitespace-nowrap">
                        حکم زون
                    </h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-8">Hokm Zone</p>

                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        );
    }

    return <AppRoutes />;
};

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <InnerApp />
        </Router>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
