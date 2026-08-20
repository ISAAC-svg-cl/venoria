"use client";

import { Settings } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function SettingsModule() {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/api/settings`, { credentials: "include" })
      .then((response) => response.json())
      .then((payload: { data?: { name?: string; currency?: string } }) => {
        setName(payload.data?.name ?? "");
        setCurrency(payload.data?.currency ?? "EUR");
      })
      .catch(() => undefined);
  }, []);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    fetch(`${apiUrl}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, currency }),
    }).then((response) => {
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <section className="module-view">
      <div className="module-heading">
        <div>
          <div className="module-title">
            <Settings size={22} />
            <h1>Paramètres de l&apos;Organisation</h1>
          </div>
          <p>Configurez l’identité, les devises et les préférences de votre établissement.</p>
        </div>
      </div>
      <form className="settings-form" onSubmit={save}>
        <div className="settings-section">
          <h2>Identité & Localisation</h2>
          <p>Ces informations seront automatiquement reportées sur vos devis et contrats.</p>
          <label>
            Nom de l’établissement / Organisation *
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex. Château de Venoria & Réceptions"
              required
            />
          </label>
          <label>
            Devise d&apos;exploitation
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar US ($)</option>
              <option value="GBP">Livre Sterling (£)</option>
              <option value="CHF">Franc Suisse (CHF)</option>
            </select>
          </label>
        </div>
        <button className="primary-button" type="submit">
          Enregistrer les paramètres
        </button>
        {saved && <span className="settings-saved">Paramètres enregistrés avec succès.</span>}
      </form>
    </section>
  );
}
