"use client";

import { Activity, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { formatAmount, type CurrencyCode } from "@/lib/currency";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

type SummaryData = {
  revenue_cents: string;
  reservations: string;
  clients: string;
  payments: string;
  halls: string;
};

export function ReportsModule() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [currency, setCurrencyState] = useState<CurrencyCode>("FC");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/api/reports/summary`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: { summary: SummaryData }) => setSummary(payload.summary))
      .catch(() => setError(true));

    // Load the currency setting from API
    fetch(`${apiUrl}/api/settings`, { credentials: "include" })
      .then((r) => r.json())
      .then((payload: { data?: { currency?: string } }) => {
        if (payload.data?.currency) {
          setCurrencyState(payload.data.currency as CurrencyCode);
        }
      })
      .catch(() => undefined);
  }, []);

  const revenueDisplay = summary
    ? formatAmount(Number(summary.revenue_cents), currency)
    : "…";

  return (
    <section className="module-view">
      <div className="module-heading">
        <div>
          <div className="module-title">
            <Activity size={22} />
            <h1>Rapports &amp; Indicateurs Clés</h1>
          </div>
          <p>Analysez la performance réelle et consolidée de votre établissement.</p>
        </div>
        <button className="select-button">
          30 derniers jours <ChevronDown size={15} />
        </button>
      </div>
      {error ? (
        <div className="module-empty">
          <Activity size={28} />
          <h2>Impossible de charger les rapports</h2>
          <p>Vérifiez la connexion au serveur puis réessayez.</p>
        </div>
      ) : (
        <div className="report-grid">
          {[
            ["Chiffre d'affaires encaissé", revenueDisplay],
            ["Réservations actives", summary?.reservations ?? "…"],
            ["Clients enregistrés", summary?.clients ?? "…"],
            ["Paiements enregistrés", summary?.payments ?? "…"],
            ["Salles d'exception", summary?.halls ?? "…"],
          ].map(([label, value]) => (
            <div className="report-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>Données en temps réel</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
