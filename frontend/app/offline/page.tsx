"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Sparkles, ShieldCheck } from "lucide-react";

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    function handleOnline() {
      window.location.href = "/dashboard";
    }
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  function handleRetry() {
    setChecking(true);
    if (navigator.onLine) {
      window.location.href = "/dashboard";
    } else {
      setTimeout(() => {
        setChecking(false);
      }, 800);
    }
  }

  return (
    <main className="offline-shell">
      <div className="offline-card">
        <div className="brand-mark light">
          <span>V</span>
          <strong>VENORIA</strong>
        </div>

        <div className="offline-icon-wrap">
          <WifiOff size={36} />
        </div>

        <div className="offline-heading">
          <p className="eyebrow gold">
            <Sparkles size={15} /> MODE SÉCURISÉ
          </p>
          <h1>Vous êtes hors connexion</h1>
          <p>
            Venoria requiert une connexion Internet active pour synchroniser vos réservations, vos contrats et vos transactions financières en toute sécurité.
          </p>
        </div>

        <div className="offline-actions">
          <button className="primary-button offline-button" onClick={handleRetry} disabled={checking}>
            <RefreshCw size={17} className={checking ? "spin-icon" : ""} />
            {checking ? "Vérification de la connexion..." : "Réessayer la connexion"}
          </button>
        </div>

        <div className="offline-security-note">
          <ShieldCheck size={16} />
          <span>Vos données locales restent protégées et chiffrées.</span>
        </div>
      </div>
    </main>
  );
}
