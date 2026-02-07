import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initOneSignal, loginAndPrompt } from "./lib/onesignal"; 
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

// Componentes
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
import MobileHeader from './components/MobileHeader'; 

// Páginas Públicas
import Home from './pages/Home';
import PublicBooking from './pages/PublicBooking';
import ClientLogin from './pages/ClientLogin';
import ClientArea from './pages/ClientArea';

function AdminArea() {
    const { user, usuario } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (usuario?.id) {
            initOneSignal();
            loginAndPrompt(usuario.id);
        }
    }, [usuario?.id]);

    if (user === undefined) return <div className="flex items-center justify-center h-screen font-bold">Carregando...</div>;
    if (user === null) return <Login />;
    if (user && usuario === null) return <div className="flex items-center justify-center h-screen font-bold">Carregando perfil...</div>;
    if (user && usuario && usuario.has_completed_onboarding === false) return <OnboardingWizard />;

    return (
        // O DataProvider agora só é ativado se o usuário estiver logado
        <DataProvider>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                {sidebarOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)} />}
                <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
                    <MobileHeader onToggleSidebar={() => setSidebarOpen(true)} />
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
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </SubscriptionGuard>
                </main>
            </div>
        </DataProvider>
    );
}

function App() {
    useEffect(() => { initOneSignal(); }, []);

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Rotas Públicas: Não usam DataProvider, logo não dão erro de Token */}
                    <Route path="/" element={<Home />} /> 
                    <Route path="/booking/:slug" element={<PublicBooking />} />
                    <Route path="/client-login" element={<ClientLogin />} />
                    <Route path="/client-area" element={<ClientArea />} />
                    
                    {/* Rota Privada: DataProvider está aqui dentro */}
                    <Route path="/*" element={<AdminArea />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;