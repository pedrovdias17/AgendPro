import React from 'react';
import { 
  Check, Instagram, Linkedin, Mail, 
  MessageSquare, Bell, Smartphone, 
  Calendar, CheckCircle2 
} from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; 

export default function Home() {
  const navigate = useNavigate();

const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const handleStartNow = () => {
    toast.info("Redirecionando...");
    
    navigate('/dashboard'); 
  };

  const faqs = [
  { 
    q: "Minha agenda de papel é de graça. Por que eu pagaria por um app?", 
    a: "O papel não é grátis, ele te custa tempo — e tempo é dinheiro. O papel não avisa quando um cliente desiste, não manda lembrete e não organiza seu financeiro. O Agendpro trabalha para você, enquanto o papel te dá trabalho." 
  },
  { 
    q: "Meus clientes preferem marcar pelo Zap. Eles vão usar o link?", 
    a: "Seu cliente quer conveniência. Poder marcar às 22h sem esperar você responder é um luxo que eles amam. Quem experimenta a facilidade do link profissional nunca mais quer voltar para a era da conversa travada no WhatsApp." 
  },
  { 
    q: "14 dias de teste é pouco tempo. É alguma pegadinha de cobrança?", 
    a: "A única pegadinha é continuar na bagunça. Não pedimos cartão de crédito para o teste. Se em 14 dias você não sentir que recuperou horas do seu dia, o sistema não é para você e está tudo bem. O risco é zero, o prejuízo de continuar parado é real." 
  },
  { 
    q: "Eu trabalho sozinho. Preciso mesmo de um sistema?", 
    a: "Justamente por ser sozinho você precisa de processos. Se você gasta tempo sendo seu próprio atendente, você está deixando de ganhar dinheiro atendendo.Está na hora de ser o especialista e focar mais na escala do seu negócio." 
  },
  { 
    q: "E se eu me complicar na configuração?", 
    a: "Você nunca estará sozinho. O AgendPro é pensado para ser o mais intuitivo possível para o usuário. Se mesmo assim tiver dificuldades, temos um botão de suporte direto no app para te orientar e auxiliar a extrair o máximo do app logo de cara. " 
  },
  { 
    q: "Eu já dou conta de marcar tudo sozinho. Por que mudar?", 
    a: "Dar conta não é crescer. Se você gasta 3 horas do dia respondendo mensagens básicas, você é escravo do seu WhatsApp. O Agendpro libera seu tempo para você focar no que realmente importa: o seu serviço e a escala do seu negócio." 
  }
];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-blue-600 tracking-tighter">Agendpro</div>
        <button 
          onClick={handleStartNow}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95"
        >
          Começar Agora
        </button>
      </nav>

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
        <div className="relative flex justify-center order-1 md:order-2">
          <div className="absolute inset-0 bg-blue-100/40 blur-3xl rounded-full -z-10" />
          <img 
            src="/celular-hero.png" 
            alt="Agendpro no celular com notificação"
            className="w-full max-w-[350px] md:max-w-[400px] drop-shadow-2xl mx-auto hover:-translate-y-2 transition-transform duration-500"
          />
        </div>
      </section>

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

      <footer className="py-12 px-6 border-t text-center">
        <div className="text-xl font-black text-blue-600 mb-2">Agendpro</div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Junte-se a profissionais que já modernizaram seu atendimento.
        </p>
      </footer>
    </div>
  );
}