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
          autoPrompt: true,
          timeDelay: 3, // Aparece 3 segundos após o login
        }
      }
    });

    oneSignalInitialized = true;
    console.log("✅ OneSignal: Motor ligado");
  });
}

export function loginAndPrompt(userId: string) {
  if (!window.OneSignal) return;

  window.OneSignal.push(async () => {
    // Vincula o ID e tenta mostrar a janelinha
    await window.OneSignal.login(userId);
    console.log("✅ OneSignal: Usuário logado:", userId);

    const permission = await window.OneSignal.Notifications.permission;
    if (permission !== "granted") {
      window.OneSignal.Slidedown.show();
    }
  });
}
