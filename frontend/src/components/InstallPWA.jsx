import { useState, useEffect, useCallback } from "react";
import { Download, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const InstallPWA = () => {
  const { t, i18n } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      // Hide the app-provided install promotion
      setIsVisible(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
    toast.dismiss();
  }, [deferredPrompt]);

  useEffect(() => {
    if (isVisible && deferredPrompt) {
      toast.custom(
        (t_toast) => (
          <div
            className={`${
              t_toast.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-zinc-200 dark:border-zinc-700 p-4`}
            dir={i18n.dir()}
          >
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Download size={20} />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t("Install Bookfly Store")}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {t("Add to home screen for a better experience")}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleInstall}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none cursor-pointer"
                    >
                      {t("Install")}
                    </button>
                    <button
                      onClick={() => {
                        toast.dismiss(t_toast.id);
                        setIsVisible(false);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none cursor-pointer"
                    >
                      {t("Not now")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => {
                  toast.dismiss(t_toast.id);
                  setIsVisible(false);
                }}
                className="bg-transparent rounded-md inline-flex text-zinc-400 hover:text-zinc-500 focus:outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ),
        {
          duration: 10000,
          position: "bottom-center",
        }
      );
    }
  }, [isVisible, deferredPrompt, t, i18n, handleInstall]);

  return null; // This component doesn't render anything directly
};

export default InstallPWA;
