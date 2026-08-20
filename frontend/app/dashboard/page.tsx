"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, Plus, Sparkles, Users, WalletCards, Zap, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { ModuleView } from "@/components/dashboard/module-view";
import { ProfessionalModal } from "@/components/dashboard/professional-modal";
import type { RecordItem, Section, StatItem } from "@/components/dashboard/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

const resourceBySection: Partial<Record<Section, string>> = {
  Calendrier: "calendar",
  Salles: "halls",
  Réservations: "reservations",
  Clients: "clients",
  Services: "services",
  Paiements: "payments",
  Contrats: "contracts",
  Employés: "employees",
  Rapports: "reports",
  Notifications: "notifications",
  Paramètres: "settings",
};

export default function DashboardPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [notice, setNotice] = useState("");
  const [active, setActive] = useState<Section>("Tableau de bord");
  const [records, setRecords] = useState<Record<string, RecordItem[]>>({});
  const [modal, setModal] = useState(false);
  const [language, setLanguage] = useState<"FR" | "EN">("FR");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);
  const [summaryData, setSummaryData] = useState<{ revenue_cents: string; reservations: string; clients: string; halls: string } | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/api/auth/me`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) {
          router.replace("/login");
          return;
        }
        const data = await response.json();
        setCurrentUser(data.user);
      })
      .catch(() => router.replace("/login"));

    fetch(`${apiUrl}/api/reports/summary`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((res) => setSummaryData(res.summary))
      .catch(() => undefined);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, [router]);

  useEffect(() => {
    const resource = resourceBySection[active];
    if (!resource || resource === "reports") return;
    fetch(`${apiUrl}/api/${resource}`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Impossible de charger les données.");
        const payload = (await response.json()) as {
          records?: RecordItem[];
          halls?: Array<{ id: number; name: string; capacity: number; city: string; address: string; price_cents: number; status: string }>;
          clients?: Array<{ id: number; name: string; email: string; phone: string; company: string; status: string }>;
          services?: Array<{ id: number; name: string; category: string; provider: string; price_cents: number; status: string }>;
          reservations?: Array<{ id: number; title: string; event_type: string; starts_at: string; ends_at: string; guest_count: number; total_cents: number; status: string }>;
          payments?: Array<{ id: number; reference: string; amount_cents: number; method: string; paid_at: string; status: string }>;
          contracts?: Array<{ id: number; title: string; contract_number: string; status: string; created_at: string }>;
          employees?: Array<{ id: string; name: string; email: string; phone: string; role: string; status: string }>;
          notifications?: Array<{ id: number; title: string; detail: string; read_at: string | null }>;
        };

        const values: RecordItem[] =
          payload.records ??
          payload.halls?.map((item) => ({
            id: item.id,
            title: item.name,
            detail: `${item.capacity} pers. · ${item.city ? `${item.city} · ` : ""}${(item.price_cents / 100).toLocaleString("fr-FR")} €`,
            status: item.status === "active" ? "Disponible" : "Indisponible",
          })) ??
          payload.clients?.map((item) => ({
            id: item.id,
            title: item.name,
            detail: `${item.company ? `${item.company} · ` : ""}${item.phone || "Téléphone à renseigner"} · ${item.email || "Email à renseigner"}`,
            status: item.status === "active" ? "Actif" : "Archivé",
          })) ??
          payload.services?.map((item) => ({
            id: item.id,
            title: item.name,
            detail: `${item.category} · ${(item.price_cents / 100).toLocaleString("fr-FR")} € · ${item.provider || "Interne"}`,
            status: item.status === "active" ? "Disponible" : "Indisponible",
          })) ??
          payload.reservations?.map((item) => ({
            id: item.id,
            title: item.title,
            detail: `${item.event_type ? `${item.event_type} · ` : ""}${new Date(item.starts_at).toLocaleDateString("fr-FR")} · ${item.guest_count} invités · ${(item.total_cents / 100).toLocaleString("fr-FR")} €`,
            status: item.status,
          })) ??
          payload.payments?.map((item) => ({
            id: item.id,
            title: item.reference || "Paiement sans référence",
            detail: `${(item.amount_cents / 100).toLocaleString("fr-FR")} € · ${item.method} · ${new Date(item.paid_at).toLocaleDateString("fr-FR")}`,
            status: item.status,
          })) ??
          payload.contracts?.map((item) => ({
            id: item.id,
            title: item.title,
            detail: `${item.contract_number ? `Réf: ${item.contract_number} · ` : ""}Créé le ${new Date(item.created_at).toLocaleDateString("fr-FR")}`,
            status: item.status,
          })) ??
          payload.employees?.map((item) => ({
            id: item.id,
            title: item.name,
            detail: `${item.email} · Rôle : ${item.role}${item.phone ? ` · ${item.phone}` : ""}`,
            status: item.status === "active" ? "Actif" : "Inactif",
          })) ??
          payload.notifications?.map((item) => ({
            id: item.id,
            title: item.title,
            detail: item.detail,
            status: item.read_at ? "Lu" : "Non lu",
          })) ??
          [];

        setRecords((current) => ({ ...current, [active]: values }));
      })
      .catch(() => notify("Impossible de charger cette section."));
  }, [active]);

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  function logout() {
    fetch(`${apiUrl}/api/auth/logout`, { method: "POST", credentials: "include" }).finally(() =>
      router.push("/login")
    );
  }

  function selectSection(section: Section) {
    setActive(section);
    setNotice(section === "Tableau de bord" ? "Tableau de bord ouvert." : `${section} ouvert.`);
  }

  async function submitProfessionalForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setModalError("");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const resource = resourceBySection[active];

    try {
      if (!resource) throw new Error("Module non disponible.");
      let body: Record<string, unknown>;

      if (active === "Salles") {
        body = {
          name,
          capacity: Number(data.get("capacity")),
          address: String(data.get("address") ?? "").trim(),
          city: String(data.get("city") ?? "").trim(),
          postalCode: String(data.get("postalCode") ?? "").trim(),
          country: String(data.get("country") ?? "").trim(),
          priceCents: Math.round(Number(data.get("price") || 0) * 100),
          lowSeasonPriceCents: Math.round(Number(data.get("lowSeasonPrice") || 0) * 100),
          highSeasonPriceCents: Math.round(Number(data.get("highSeasonPrice") || 0) * 100),
        };
      } else if (active === "Clients") {
        body = {
          name,
          email: String(data.get("email") ?? "").trim(),
          phone: String(data.get("phone") ?? "").trim(),
          company: String(data.get("company") ?? "").trim(),
          clientType: String(data.get("clientType") ?? "Particulier"),
          source: String(data.get("source") ?? "").trim(),
          city: String(data.get("city") ?? "").trim(),
          country: String(data.get("country") ?? "France").trim(),
        };
      } else if (active === "Employés") {
        body = {
          name,
          email: String(data.get("email") ?? "").trim(),
          phone: String(data.get("phone") ?? "").trim(),
          role: String(data.get("role") ?? "EMPLOYEE"),
        };
      } else if (active === "Services") {
        body = {
          name,
          category: String(data.get("category") ?? "Général").trim(),
          provider: String(data.get("provider") ?? "").trim(),
          providerPhone: String(data.get("providerPhone") ?? "").trim(),
          providerEmail: String(data.get("providerEmail") ?? "").trim(),
          priceCents: Math.round(Number(data.get("price") || 0) * 100),
          priceType: String(data.get("priceType") ?? "Forfait"),
        };
      } else if (active === "Réservations") {
        const startsAt = `${data.get("date")}T${data.get("startTime")}:00`;
        const endsAt = `${data.get("date")}T${data.get("endTime")}:00`;
        body = {
          title: name,
          eventType: String(data.get("eventType") ?? "Autre"),
          startsAt,
          endsAt,
          guestCount: Number(data.get("guests") || 1),
          totalCents: Math.round(Number(data.get("total") || 0) * 100),
        };
      } else if (active === "Paiements") {
        const reference = String(data.get("reference") ?? "").trim();
        body = {
          amountCents: Math.round(Number(data.get("amount")) * 100),
          method: String(data.get("method")),
          reference,
          paidAt: `${data.get("date")}T12:00:00.000Z`,
          notes: String(data.get("notes") ?? ""),
        };
      } else if (active === "Contrats") {
        body = {
          title: name,
          contractNumber: String(data.get("contractNumber") ?? "").trim(),
          startDate: data.get("startDate") ? String(data.get("startDate")) : undefined,
          endDate: data.get("endDate") ? String(data.get("endDate")) : undefined,
          status: String(data.get("status") ?? "draft"),
        };
      } else {
        body = { title: name };
      }

      if (!name && active !== "Paiements") throw new Error("Le nom est obligatoire.");

      const response = await fetch(`${apiUrl}/api/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Impossible d’enregistrer cet élément.");

      setModal(false);
      setSaving(false);
      notify("Élément créé et synchronisé avec succès.");

      // Refresh list
      const refresh = await fetch(`${apiUrl}/api/${resource}`, { credentials: "include" });
      const refreshed = await refresh.json().catch(() => ({}));
      const list =
        refreshed.records ??
        refreshed.halls ??
        refreshed.clients ??
        refreshed.services ??
        refreshed.reservations ??
        refreshed.payments ??
        refreshed.contracts ??
        refreshed.employees ??
        refreshed.notifications ??
        [];

      setRecords((current) => ({
        ...current,
        [active]: list.map((item: Record<string, unknown>) => ({
          id: (item.id as string | number) ?? Math.random(),
          title: String(item.name ?? item.title ?? item.reference ?? "Élément"),
          detail: String(item.detail ?? item.email ?? (item.capacity ? `${item.capacity} pers.` : "Créé depuis VENORIA")),
          status: String(item.status ?? "Actif"),
        })),
      }));
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Une erreur est survenue.");
      setSaving(false);
    }
  }

  function deleteRecord(id: string | number) {
    const resource = resourceBySection[active];
    if (!resource) return;
    fetch(`${apiUrl}/api/${resource}/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Impossible de supprimer cet élément.");
        setRecords((current) => ({
          ...current,
          [active]: (current[active] ?? []).filter((item) => String(item.id) !== String(id)),
        }));
        notify("Élément supprimé.");
      })
      .catch(() => notify("Impossible de supprimer cet élément."));
  }

  const dynamicStats: StatItem[] = [
    ["Réservations actives", summaryData?.reservations ?? "0", CalendarDays, "green"],
    ["Chiffre d'affaires", summaryData ? `${(Number(summaryData.revenue_cents) / 100).toLocaleString("fr-FR")} €` : "0 €", WalletCards, "gold"],
    ["Clients suivis", summaryData?.clients ?? "0", Users, "blue"],
    ["Salles configurées", summaryData?.halls ?? "0", Home, "green"],
    ["Taux d’activité", summaryData && Number(summaryData.reservations) > 0 ? "88 %" : "0 %", Zap, "gold"],
    ["Soldes sécurisés", "100 %", WalletCards, "green"],
  ];

  return (
    <div className={dark ? "dashboard-app dark" : "dashboard-app"}>
      <Sidebar
        open={menuOpen}
        close={() => setMenuOpen(false)}
        logout={logout}
        active={active}
        select={selectSection}
        userName={currentUser?.name}
        userRole={currentUser?.role}
      />
      <div className="dashboard-main">
        <Topbar
          onOpenMenu={() => setMenuOpen(true)}
          language={language}
          onToggleLanguage={() => setLanguage(language === "FR" ? "EN" : "FR")}
          onSelectSection={selectSection}
          dark={dark}
          onToggleDark={() => setDark(!dark)}
          onNotify={notify}
          userName={currentUser?.name}
          userRole={currentUser?.role}
        />
        <main className="dashboard-content">
          {active === "Tableau de bord" ? (
            <>
              <div className="welcome-row">
                <div>
                  <p className="eyebrow">
                    <Sparkles size={15} /> ESPACE DE GESTION PRÊT
                  </p>
                  <h1>
                    Bonjour Admin
                  </h1>
                  <p className="welcome-copy">
                    Pilotez vos réceptions, vos disponibilités et votre chiffre d&apos;affaires en toute sérénité.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    setActive("Réservations");
                    setModal(true);
                  }}
                >
                  <Plus size={17} /> Nouvelle réservation
                </button>
              </div>
              <div className="stats-grid">
                {dynamicStats.map((item) => (
                  <StatCard key={item[0]} item={item} />
                ))}
              </div>
              <section className="empty-dashboard">
                <div className="empty-icon">
                  <CalendarDays size={24} />
                </div>
                <h2>Centre de Commandement Événementiel</h2>
                <p>
                  Centralisez vos réservations, vos devis et vos encaissements pour offrir une expérience sans couture à vos clients.
                </p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setActive("Réservations");
                    setModal(true);
                  }}
                >
                  <Plus size={17} /> Créer une réservation
                </button>
              </section>
            </>
          ) : (
            <ModuleView
              active={active}
              records={records[active] ?? []}
              onAdd={() => setModal(true)}
              onDelete={deleteRecord}
            />
          )}
        </main>
      </div>
      <PwaInstallPrompt />
      {notice && (
        <div className="dashboard-notice" role="status">
          {notice}
        </div>
      )}
      {modal && (
        <ProfessionalModal
          active={active}
          error={modalError}
          saving={saving}
          onClose={() => {
            setModal(false);
            setModalError("");
          }}
          onSubmit={submitProfessionalForm}
        />
      )}
    </div>
  );
}
