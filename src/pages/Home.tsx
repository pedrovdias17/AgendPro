import React from 'react';
import { 
  Check, Instagram, Linkedin, Mail, 
  MessageSquare, Bell, Smartphone, 
  ArrowRight, CheckCircle2, X 
} from 'lucide-react';
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleStartNow = () => {
    toast.info("Redirecionando...");
    setLocation('/dashboard'); 
  };

  const faqs = [
    { 
      q: "O Agendpro tem teste grátis?", 
      a: "Sim, você pode testar todas as funcionalidades gratuitamente por 14 dias. Sem necessidade de cartão de crédito." 
    },
    { 
      q: "Precisa de WhatsApp Business?", 
      a: "Não, o sistema funciona com qualquer conta de WhatsApp, seja pessoal ou Business." 
    },
    { 
      q: "Funciona offline?", 
      a: "Não, o Agendpro é uma ferramenta online para garantir sincronização em tempo real de qualquer lugar." 
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* HEADER */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-blue-600 tracking-tighter">Agendpro</div>
        <button 
          onClick={handleStartNow}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95"
        >
          Começar Agora
        </button>
      </nav>

      {/* HERO */}
      <section className="px-6 py-12 md:py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
            Pare de perder tempo <span className="text-blue-600">(e dinheiro)</span> com agendamentos manuais.
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto md:mx-0">
            O Agendpro é a ferramenta definitiva para profissionais que querem uma agenda cheia, organizada e sem furos no WhatsApp.
          </p>
          <button 
            onClick={handleStartNow}
            className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            Começar Agora
          </button>
          <div className="flex justify-center md:justify-start items-center gap-6 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-2"><Check size={16} className="text-blue-500"/> 14 dias grátis</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-blue-500"/> Sem cartão de crédito</span>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-blue-100/40 blur-3xl rounded-full -z-10" />
          {/* Mockup do Celular com a Notificação */}
          <div className="relative bg-white p-4 rounded-[3rem] shadow-2xl border-[8px] border-slate-900 w-full max-w-[300px]">
             <div className="bg-slate-100 rounded-2xl p-4 mt-20 shadow-sm border border-white">
                <div className="flex items-center gap-3">
                   <div className="bg-blue-600 p-2 rounded-lg text-white"><Calendar size={18}/></div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Novo Agendamento</p>
                      <p className="text-xs font-bold text-slate-800">Cliente Pedro - 15:00</p>
                   </div>
                </div>
             </div>
             <div className="h-64" /> {/* Espaço simulando o restante da tela */}
          </div>
        </div>
      </section>

      {/* COMPARATIVO */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">O Problema</h3>
            <ul className="space-y-4 text-slate-500 font-medium text-sm">
              <li className="flex items-center gap-3">📋 Agenda de papel e clientes que esquecem</li>
              <li className="flex items-center gap-3">⏰ Horas perdidas respondendo mensagens</li>
              <li className="flex items-center gap-3">💸 Furos na agenda e perda de receita</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6">Agendpro</h3>
            <ul className="space-y-4 text-blue-900 font-bold text-sm">
              <li className="flex items-center gap-3"><Check size={18}/> Link de reserva 24h disponível</li>
              <li className="flex items-center gap-3"><Check size={18}/> Notificações no celular em tempo real</li>
              <li className="flex items-center gap-3"><Check size={18}/> Confirmação em 1 clique via WhatsApp</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-10">Perguntas Frequentes</h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl">
              <p className="font-bold text-slate-900 mb-2">{f.q}</p>
              <p className="text-sm text-slate-500 font-medium">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t text-center">
        <div className="text-xl font-black text-blue-600 mb-2">Agendpro</div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Junte-se a profissionais que já modernizaram seu atendimento.
        </p>
      </footer>
    </div>
  );
}