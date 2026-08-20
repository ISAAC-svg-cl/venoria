"use client";

import { Download, RefreshCw, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    __venoriaInstallPrompt?: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // 1. Detect standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone;

    const iosDetected =
      typeof navigator !== "undefined" &&
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;

    setIsIOS(iosDetected);

    // 2. Listen for install prompt on supported browsers (Chrome, Edge, Android)
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      const installEvent = event as BeforeInstallPromptEvent;
      setPrompt(installEvent);
      if (!isStandalone && !window.localStorage.getItem("venoria-pwa-dismissed")) {
        setVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);

    // 3. Check for app installed event
    const handleAppInstalled = () => {
      setVisible(false);
      setPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // 4. Register Service Worker and track updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Detect waiting worker on initial load
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
          }

          // Detect new worker installed
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch(() => undefined);

      // Reload when new worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    if (iosDetected && !isStandalone && !window.localStorage.getItem("venoria-pwa-dismissed")) {
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
      }
    }
  }

  function handleDismiss() {
    window.localStorage.setItem("venoria-pwa-dismissed", "true");
    setVisible(false);
  }

  function applyUpdate() {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
  }

  return (
    <>
      {updateAvailable && (
        <div className="pwa-update-banner" role="alert">
          <div>
            <strong>Mise à jour disponible</strong>
            <p style={{ margin: 0, fontSize: "11px", opacity: 0.9 }}>Une nouvelle version de Venoria est prête.</p>
          </div>
          <button onClick={applyUpdate}>
            <RefreshCw size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
            Mettre à jour
          </button>
        </div>
      )}

      {visible && (
        <aside className="pwa-prompt" role="dialog" aria-label="Installation de l'application">
          <button className="pwa-close" onClick={handleDismiss} aria-label="Fermer la suggestion d'installation">
            <X size={16} />
          </button>
          <div className="pwa-icon">
            {isIOS ? <Share size={18} /> : <Download size={20} />}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <strong>Installer Venoria</strong>
            <p>
              {isIOS
                ? "Touchez Partager ⎋ puis 'Sur l'écran d'accueil' pour installer l'application."
                : "Accédez à votre espace en un clic depuis votre bureau ou écran d'accueil."}
            </p>
          </div>
          {!isIOS && prompt && (
            <button className="pwa-install" onClick={handleInstall}>
              Installer
            </button>
          )}
        </aside>
      )}
    </>
  );
}
