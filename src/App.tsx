import  { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Componentes do Dono do Negócio
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Professionals from './components/Professionals';
import Services from './components/Services';
import Schedule from './components/Schedule';
import Clients from './components/Clients';
import Settings from './components/Settings';
import Upgrade from './components/Upgrade';
import Legal from './components/Legal';
import Sidebar from './components/Sidebar';
import SubscriptionGuard from './components/SubscriptionGuard';
import OnboardingWizard from './components/OnboardingWizard';

// Páginas Públicas e da Área do Cliente
import PublicBooking from './pages/PublicBooking';
import PaymentSuccess from './pages/PaymentSuccess'; // 1. NOVA IMPORTAÇÃO
import PaymentCancel from './pages/PaymentCancel';   // 1. NOVA IMPORTAÇÃO
import ClientLogin from './pages/ClientLogin';
import ClientArea from './pages/ClientArea';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

function AdminArea() {
  const { user, usuario } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  if (user === null) {
    return <Login />;
  }

    // 'user' existe (logado), mas o 'usuario' (perfil do banco) AINDA não foi carregado
    // (O 'usuario' começa como 'null' no AuthContext)
    if (user && usuario === null) {
        return (
            <div className="flex items-center justify-center h-screen">
                Carregando perfil...
            </div>
        );
    }

    // 'user' existe, 'usuario' (perfil) existe, e a flag de onboarding é 'false'
    if (user && usuario && usuario.has_completed_onboarding === false) {
        // Mostra APENAS o wizard em tela cheia
        return <OnboardingWizard />;
    }
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <SubscriptionGuard>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/professionals" element={<Professionals />} />
            <Route path="/services" element={<Services />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/legal" element={<Legal />} />

            {/* 2. NOVAS ROTAS ADICIONADAS */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SubscriptionGuard>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/booking/:slug" element={<PublicBooking />} />
            <Route path="/client-login" element={<ClientLogin />} />
            <Route path="/client-area" element={<ClientArea />} />
            <Route path="/*" element={<AdminArea />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;