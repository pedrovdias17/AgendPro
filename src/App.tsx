import {useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Componentes do Dono do Negócio
import { initOneSignal, loginOneSignal } from "./lib/onesignal"; 
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

// Páginas Públicas e da Área do Cliente
import PublicBooking from './pages/PublicBooking';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import ClientLogin from './pages/ClientLogin';
import ClientArea from './pages/ClientArea';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';


function AdminArea() {
    const { user, usuario } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Só vincula se o perfil do usuário (do seu banco) já estiver carregado
        if (usuario?.id) {
            initOneSignal();
            loginAndPrompt(usuario.id);
        }
    }, [usuario?.id]);

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
    if (user && usuario === null) {
        return (
            <div className="flex items-center justify-center h-screen">
                Carregando perfil...
            </div>
        );
    }
    if (user && usuario && usuario.has_completed_onboarding === false) {
        return <OnboardingWizard />;
    }

    // --- Início das Mudanças de Layout ---
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            {/* <<< 3. OVERLAY (para fechar a sidebar no mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* <<< 4. MUDANÇA NO 'className' DO MAIN */}
            {/* Remove 'ml-16'/'ml-64' no mobile, mantendo só no desktop ('md:') */}
            <main className={`flex-1 transition-all duration-300 ${
                sidebarOpen ? 'md:ml-64' : 'md:ml-16'
            }`}>

                {/* <<< 5. HEADER MOBILE ADICIONADO */}
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

        useEffect(() => {
  initOneSignal();
}, []);

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