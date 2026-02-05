// onesignal.ts

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
      // Slidedown é melhor para mobile
      promptOptions: {
        slidedown: {
          enabled: true,
          autoPrompt: true,
          timeDelay: 5,
        }
      }
    });

    oneSignalInitialized = true;
    console.log("✅ OneSignal inicializado");
  });
}

export function loginAndPrompt(userId: string) {
  if (!window.OneSignal) return;

  window.OneSignal.push(async () => {
    // 1. Faz o login do usuário
    await window.OneSignal.login(userId);
    console.log("✅ OneSignal logado:", userId);

    // 2. Verifica se o usuário já deu permissão. Se não, abre a caixinha na hora!
    const isPushEnabled = await window.OneSignal.Notifications.permission;
    if (isPushEnabled !== "granted") {
      console.log("🔔 Solicitando permissão de notificação...");
      window.OneSignal.Slidedown.show();
    }
  });
}