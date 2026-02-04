// src/lib/onesignal.ts

declare global {
  interface Window {
    OneSignal: any;
  }
}

// Essa variável fica FORA das funções para sobreviver ao "re-render" do React
let isInitializing = false;

export function initOneSignal() {
  // Se já começou a inicializar ou já terminou, cai fora
  if (isInitializing || (window.OneSignal && window.OneSignal.initialized)) {
    return;
  }

  isInitializing = true;
  window.OneSignal = window.OneSignal || [];

  window.OneSignal.push(async () => {
    try {
      await window.OneSignal.init({
        appId: "993668eb-af43-4b96-a7bb-6facdb39c9f5",
        allowLocalhostAsSecureOrigin: true,
        notifyButton: { enable: true },
      });
      console.log("✅ OneSignal: Motor ligado");
    } catch (err) {
      isInitializing = false; // Se deu erro, permite tentar de novo
      console.error("❌ OneSignal Init Error:", err);
    }
  });
}

export function loginOneSignal(userId: string) {
  window.OneSignal = window.OneSignal || [];
  window.OneSignal.push(async () => {
    // Só tenta o login se o SDK já estiver inicializado
    if (window.OneSignal.initialized) {
      await window.OneSignal.login(userId);
      console.log("✅ OneSignal: Usuário vinculado:", userId);
    } else {
      // Se não estiver pronto, tenta inicializar e enfileira o login
      initOneSignal();
      window.OneSignal.push(() => window.OneSignal.login(userId));
    }
  });
}