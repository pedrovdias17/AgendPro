declare global {
  interface Window {
    OneSignal: any;
  }
}

let oneSignalInitialized = false;

export function initOneSignal() {
  if (typeof window === "undefined" || oneSignalInitialized) return;

  window.OneSignal = window.OneSignal || [];
  window.OneSignal.push(() => {
    window.OneSignal.init({
      appId: "993668eb-af43-4b96-a7bb-6facdb39c9f5",
      allowLocalhostAsSecureOrigin: true,
      promptOptions: {
        slidedown: {
          enabled: true,
          autoPrompt: false,
        }
      }
    });

    oneSignalInitialized = true;
    console.log("✅ OneSignal: Motor ligado");
  });
}

export function loginAndPrompt(userId: string) {
  if (!window.OneSignal) {
    console.error("❌ OneSignal não encontrado no window");
    return;
  }

  window.OneSignal.push(async () => {
    try {
      console.log("🔄 Tentando vincular e mostrar prompt...");
      await window.OneSignal.login(userId);
      
      await window.OneSignal.Slidedown.show({ force: true });
      
      console.log("🚀 OneSignal: Comando Slidedown enviado com sucesso");
    } catch (err) {
      console.error("❌ Erro ao disparar OneSignal:", err);
    }
  });
}