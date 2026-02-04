declare global {
  interface Window {
    OneSignal: any;
  }
}

let oneSignalInitialized = false;

export function initOneSignal() {
  if (!window.OneSignal || oneSignalInitialized) return;

  window.OneSignal.push(() => {
    window.OneSignal.init({
      appId: "993668eb-af43-4b96-a7bb-6facdb39c9f5",
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: true,
      },
    });

    oneSignalInitialized = true;
    console.log("OneSignal inicializado");
  });
}

export function loginOneSignal(userId: string) {
  if (!window.OneSignal || !oneSignalInitialized) return;

  window.OneSignal.push(() => {
    window.OneSignal.login(userId);
    console.log("OneSignal login:", userId);
  });
}
