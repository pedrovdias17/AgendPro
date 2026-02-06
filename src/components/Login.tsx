import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Building, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, resetPassword, loginWithGoogle } = useAuth();

  // Estados principais
  const [isLogin, setIsLogin] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Estados do Formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [nomeStudio, setNomeStudio] = useState('');
  const [slug, setSlug] = useState('');
  
  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Verifica se o botão "Começar agora" da Home enviou o comando para abrir no Cadastro
  useEffect(() => {
    if (location.state?.activeTab === 'register') {
      setIsLogin(false);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Fluxo de Login
        const result = await login(email, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'E-mail ou senha incorretos.');
        }
      } else {
        // Fluxo de Cadastro
        if (!nome || !nomeStudio || !slug) {
          setError('Preencha todos os campos para criar sua conta.');
          setIsLoading(false);
          return;
        }

        const result = await signup(email, password, nome, nomeStudio, slug);
        if (result.success) {
          setVerificationSent(true);
        } else {
          setError(result.error || 'Erro ao criar conta. Tente outro e-mail.');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // O redirecionamento do Google é tratado pelo Supabase
    } catch (err) {
      setError('Erro ao autenticar com o Google.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setError('');
    } catch (err) {
      setError('Erro ao enviar e-mail de recuperação.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. TELA DE SUCESSO NO CADASTRO (ORIENTAÇÃO DE E-MAIL)
  if (verificationSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Verifique seu e-mail</h2>
          <p className="text-gray-500 mb-8 font-medium leading-relaxed">
            Quase lá! Enviamos um link de confirmação para o e-mail <strong>{email}</strong>. 
            <br /><br />
            Clique no link enviado para ativar sua conta e liberar seu acesso ao Agendpro.
          </p>
          <button
            onClick={() => { setVerificationSent(false); setIsLogin(true); }}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 active:scale-95 transition-all"
          >
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  // 2. TELA DE RECUPERAÇÃO DE SENHA
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Recuperar Senha</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">Digite seu e-mail para receber as instruções.</p>
          
          {resetSent ? (
            <div className="bg-green-50 p-4 rounded-2xl text-green-700 text-sm font-bold mb-6">
              E-mail enviado! Verifique sua caixa de entrada.
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-medium" 
                placeholder="Seu e-mail"
              />
              <button disabled={isLoading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">
                {isLoading ? 'Enviando...' : 'Enviar Link'}
              </button>
            </form>
          )}
          <button 
            onClick={() => setShowForgotPassword(false)} 
            className="w-full mt-4 text-sm font-bold text-gray-400"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // 3. TELA DE LOGIN / CADASTRO
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-xl mb-4">
            <Scissors size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Agendpro</h1>
          <p className="text-gray-500 font-medium mt-1">Sua agenda no piloto automático</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
          {/* TABS */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
            >
              Cadastrar
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-4 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Seu Nome Completo" 
                    required 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
                <div className="relative">
                  <Building className="absolute left-4 top-4 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Nome do seu Negócio" 
                    required 
                    value={nomeStudio}
                    onChange={(e) => setNomeStudio(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
                <div className="relative">
                  <Globe className="absolute left-4 top-4 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="link-do-seu-negocio" 
                    required 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
              <input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div className="relative">
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Sua senha" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <button 
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Aguarde...' : isLogin ? 'Entrar Agora' : 'Criar Conta Gratuita'}
              {!isLoading && <ArrowRight size={20} />}
            </button>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-white border border-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5" alt="Google" />
              Continuar com Google
            </button>
          </form>

          {isLogin && (
            <button 
              onClick={() => setShowForgotPassword(true)}
              className="w-full mt-6 text-sm font-bold text-blue-600/60 hover:text-blue-600 transition-colors"
            >
              Esqueci minha senha
            </button>
          )}

          {!isLogin && (
            <div className="mt-8 p-4 bg-blue-50 rounded-2xl">
              <p className="text-xs text-blue-800 font-bold flex items-center gap-2">
                <CheckCircle2 size={14} /> 14 dias de teste totalmente grátis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}