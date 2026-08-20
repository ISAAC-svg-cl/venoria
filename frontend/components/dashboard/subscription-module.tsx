"use client";

import { Check, CheckCircle2, CreditCard, Crown, Download, FileText, HelpCircle, Shield, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

export function SubscriptionModule() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);

  const plans = [
    {
      id: "essential",
      name: "Formule Essentielle",
      tagline: "Pour démarrer la gestion de votre première salle de réception.",
      priceMonthly: 49,
      priceYearly: 39,
      features: [
        "Jusqu'à 2 salles de prestige",
        "Réservations et calendrier interactif",
        "Gestion complète des clients",
        "Génération de contrats PDF",
        "Support standard par email",
      ],
      current: false,
      recommended: false,
    },
    {
      id: "prestige",
      name: "Formule Prestige Illimitée",
      tagline: "L'expérience complète pour les propriétaires d'espaces d'exception.",
      priceMonthly: 149,
      priceYearly: 119,
      features: [
        "Nombre de salles illimité",
        "Réservations & Événements illimités",
        "Galerie photos HD & Lightbox intégrée",
        "Contrats & Factures avec signature électronique",
        "Graphiques financiers & Rapports de performance",
        "Détection automatique des conflits de dates",
        "Cloud sécurisé 100 Go & Sauvegardes continues",
        "Conciergerie & Support VIP dédié 24/7",
      ],
      current: true,
      recommended: true,
    },
    {
      id: "elite",
      name: "Formule Élite & Multi-Sites",
      tagline: "Pour les domaines, châteaux et groupes événementiels prestigieux.",
      priceMonthly: 299,
      priceYearly: 249,
      features: [
        "Multi-établissements & Domaines",
        "Comptes administrateurs & collaborateurs illimités",
        "Accès API directe & Webhooks personnalisés",
        "Personnalisation de marque blanche (White-Label)",
        "Gestionnaire de compte dédié & formation équipe",
        "Audit de sécurité personnalisé & SLA 99.99%",
      ],
      current: false,
      recommended: false,
    },
  ];

  const invoices = [
    {
      id: "INV-2026-08",
      date: "20 Août 2026",
      amount: "119,00 $",
      period: "Août 2026 - Août 2027",
      status: "Payée",
    },
    {
      id: "INV-2025-08",
      date: "20 Août 2025",
      amount: "119,00 $",
      period: "Août 2025 - Août 2026",
      status: "Payée",
    },
  ];

  function handleDownloadInvoice(invId: string) {
    setCopiedInvoice(invId);
    setTimeout(() => setCopiedInvoice(null), 2500);
    import("@/lib/pdf-generator").then((mod) => {
      mod.generateInvoicePdf({
        reference: invId,
        clientName: "Administrateur VENORIA",
        amount: "119.00",
        currency: "$",
        date: new Date().toLocaleDateString("fr-FR"),
        method: "Carte Bancaire (•••• 4242)",
        status: "Payée",
      });
    });
  }

  return (
    <section className="subscription-view">
      {/* Header Banner */}
      <div className="subscription-hero">
        <div className="subscription-hero-badge">
          <Crown size={18} />
          <span>MEMBRE VIP PRESTIGE</span>
        </div>
        <div className="subscription-hero-content">
          <div>
            <h1>Abonnement &amp; Formule Active</h1>
            <p>
              Votre établissement bénéficie actuellement de la suite complète <strong>VENORIA Prestige</strong> avec accès illimité à l&apos;ensemble des fonctionnalités.
            </p>
          </div>
          <div className="subscription-status-pill">
            <span className="pulse-dot" />
            <span>Abonnement Actif · Renouvellement automatique</span>
          </div>
        </div>
      </div>

      {/* Current Active Plan Overview */}
      <div className="subscription-current-card">
        <div className="current-plan-header">
          <div className="current-plan-brand">
            <div className="plan-icon-wrap">
              <Sparkles size={24} />
            </div>
            <div>
              <small>VOTRE FORMULE ACTUELLE</small>
              <h2>VENORIA Prestige Illimité</h2>
              <span>Facturation annuelle avantageuse (20% d&apos;économie appliquée)</span>
            </div>
          </div>
          <div className="current-plan-pricing">
            <div className="price-tag">
              <strong>119 $</strong>
              <span>/ mois</span>
            </div>
            <span className="renew-info">Prochain renouvellement : 20 Août 2027</span>
          </div>
        </div>

        <div className="current-plan-meta-grid">
          <div className="meta-item">
            <div className="meta-icon"><Shield size={18} /></div>
            <div>
              <strong>Mode de paiement</strong>
              <span>Visa terminant par •••• 4242</span>
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-icon"><Zap size={18} /></div>
            <div>
              <strong>Capacité Salles &amp; Événements</strong>
              <span>Illimitée (Sans restriction)</span>
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-icon"><CreditCard size={18} /></div>
            <div>
              <strong>Stockage &amp; Données</strong>
              <span>100 Go Cloud Chiffré &amp; Sécurisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Comparison */}
      <div className="subscription-plans-section">
        <div className="plans-heading">
          <div>
            <h2>Toutes nos formules</h2>
            <p>Faites évoluer votre abonnement à tout moment selon les besoins de votre domaine.</p>
          </div>
          <div className="billing-toggle">
            <button
              type="button"
              className={billingCycle === "monthly" ? "active" : ""}
              onClick={() => setBillingCycle("monthly")}
            >
              Mensuel
            </button>
            <button
              type="button"
              className={billingCycle === "yearly" ? "active" : ""}
              onClick={() => setBillingCycle("yearly")}
            >
              Annuel <span className="discount-badge">-20%</span>
            </button>
          </div>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => {
            const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
            return (
              <article key={plan.id} className={`plan-card ${plan.current ? "current" : ""} ${plan.recommended ? "recommended" : ""}`}>
                {plan.current && (
                  <div className="plan-badge-current">
                    <CheckCircle2 size={13} /> Formule Active
                  </div>
                )}
                <div className="plan-card-top">
                  <h3>{plan.name}</h3>
                  <p className="plan-tagline">{plan.tagline}</p>
                  <div className="plan-price">
                    <strong>{price} $</strong>
                    <span>/ mois</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <span className="yearly-hint">Facturé {price * 12} $ par an</span>
                  )}
                </div>

                <div className="plan-divider" />

                <ul className="plan-features">
                  {plan.features.map((feat) => (
                    <li key={feat}>
                      <Check size={16} className="check-icon" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="plan-card-bottom">
                  {plan.current ? (
                    <button type="button" className="primary-button plan-btn active-btn" disabled>
                      <CheckCircle2 size={16} /> Formule en cours d&apos;utilisation
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="secondary-button plan-btn"
                      onClick={() => alert(`Pour passer à la ${plan.name}, contactez votre concierge VIP VENORIA.`)}
                    >
                      Choisir cette formule
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Invoices History */}
      <div className="subscription-invoices-card">
        <div className="invoices-heading">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={20} style={{ color: "var(--gold)" }} />
            <div>
              <h2>Historique des factures d&apos;abonnement</h2>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                Téléchargez vos reçus et factures certifiées pour votre comptabilité.
              </p>
            </div>
          </div>
        </div>

        <div className="invoices-list">
          {invoices.map((inv) => (
            <div key={inv.id} className="invoice-row">
              <div className="invoice-info">
                <strong>Facture {inv.id}</strong>
                <span>{inv.date} · Période : {inv.period}</span>
              </div>
              <div className="invoice-meta">
                <span className="invoice-amount">{inv.amount}</span>
                <span className="status status-confirmée">{inv.status}</span>
                <button
                  type="button"
                  className="icon-button invoice-dl-btn"
                  title="Télécharger la facture PDF"
                  onClick={() => handleDownloadInvoice(inv.id)}
                >
                  <Download size={16} />
                  <span>{copiedInvoice === inv.id ? "Téléchargée !" : "PDF"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Guarantee Note */}
      <div className="subscription-guarantee">
        <HelpCircle size={18} />
        <span>
          Facturation sécurisée avec protocole bancaire SSL 256 bits. Annulation ou modification de formule sans engagement en un clic.
        </span>
      </div>
    </section>
  );
}
