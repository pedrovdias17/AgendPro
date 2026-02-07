declare global {
  interface Window {
    OneSignal: any;
  }
}

let oneSignalInitialized = false;

export function initOneSignal() {
  if (typeof window === "undefined" || oneSignalInitialized) return;

  // Garante que o OneSignal existe no window antes de tentar usar
  window.OneSignal = window.OneSignal || [];
  
  window.OneSignal.push(() => {
    // Se já foi inicializado internamente pelo SDK, não faz nada
    if (window.OneSignal.initialized) return;

    window.OneSignal.init({
      appId: "993668eb-af43-4b96-a7bb-6facdb39c9f5", // Seu ID
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerParam: { scope: "/" }, // Garante o escopo correto do worker
      promptOptions: {
        slidedown: {
          enabled: true,
          autoPrompt: false,
        }
      }
    });

    oneSignalInitialized = true;
    console.log("✅ OneSignal: Motor carregado com sucesso");
  });
}

export function loginAndPrompt(userId: string) {
  if (typeof window === "undefined") return;

  window.OneSignal.push(async () => {
    try {
      // Verifica se o OneSignal está realmente pronto
      if (!window.OneSignal.login) {
        console.warn("⏳ OneSignal ainda não está pronto para o login...");
        return;
      }

      console.log("🔄 Vinculando usuário:", userId);
      await window.OneSignal.login(userId);
      
      // Só mostra o prompt se o usuário ainda não deu permissão
      const permission = await window.OneSignal.Notifications.permission;
      if (permission === "default") {
        await window.OneSignal.Slidedown.show({ force: true });
        console.log("🚀 OneSignal: Prompt enviado");
      }
    } catch (err) {
      console.error("❌ Erro no fluxo OneSignal:", err);
    }
  });
}