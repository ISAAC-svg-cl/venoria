"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Saisissez une adresse e-mail valide.");
      return;
    }
    if (!password) {
      setError("Le mot de passe est obligatoire.");
      return;
    }
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, rememberMe: remember }),
    }).then(async (response) => {
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Impossible de vous connecter.");
      }
      router.push("/dashboard");
    }).catch((submitError: Error) => {
      setError(submitError.message === "Failed to fetch" ? "Le serveur VENORIA est indisponible. Démarrez PostgreSQL et le backend, puis réessayez." : submitError.message);
      setLoading(false);
    });
  }

  return (
    <main className="login-shell">
      <section className="login-story">
        <div className="story-orbit orbit-one" />
        <div className="story-orbit orbit-two" />
        <div className="story-content">
          <div className="brand-mark light"><span>V</span><strong>VENORIA</strong></div>
          <div className="story-copy">
            <p className="eyebrow gold"><Sparkles size={15} /> L&apos;élégance, orchestrée</p>
            <h1>Vos plus beaux événements, en parfaite harmonie.</h1>
            <p>Un espace confidentiel pour piloter vos salles, vos réservations et chaque détail qui compte.</p>
          </div>
          <div className="story-foot"><ShieldCheck size={17} /> Vos données sont protégées et chiffrées.</div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-brand brand-mark"><span>V</span><strong>VENORIA</strong></div>
          <div className="login-heading">
            <p className="eyebrow">ESPACE ADMINISTRATEUR</p>
            <h2>Bienvenue à nouveau</h2>
            <p>Connectez-vous pour retrouver votre activité.</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {error && <div className="form-error" role="alert">{error}</div>}
            <label>Adresse e-mail<div className="input-wrap"><Mail size={18} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@venoria.fr" autoComplete="email" /></div></label>
            <label>Mot de passe<div className="input-wrap"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" autoComplete="current-password" /><button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            <div className="login-options"><label className="check-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> <span>Se souvenir de moi</span></label><button type="button" className="text-button">Mot de passe oublié ?</button></div>
            <button className="primary-button login-button" disabled={loading}>{loading ? <><span className="spinner" /> Connexion en cours...</> : <>Se connecter <ArrowRight size={17} /></>}</button>
          </form>
          <p className="login-note">Accès réservé aux administrateurs de VENORIA</p>
        </div>
      </section>
    </main>
  );
}
