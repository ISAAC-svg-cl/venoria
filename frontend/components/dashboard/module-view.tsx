"use client";

import { FileText, LayoutDashboard, Maximize2, Plus, X } from "lucide-react";
import { useState } from "react";
import { navigation } from "./sidebar";
import { moduleConfig } from "./professional-modal";
import { PaymentModule } from "./payment-module";
import { ReportsModule } from "./reports-module";
import { SettingsModule } from "./settings-module";
import { NotificationsModule } from "./notifications-module";
import { CalendarModule } from "./calendar-module";
import type { RecordItem, Section } from "./types";

const sectionIcons = Object.fromEntries(navigation) as Record<string, typeof LayoutDashboard>;

interface ModuleViewProps {
  active: Section;
  records: RecordItem[];
  onAdd: () => void;
  onDelete: (id: string | number) => void;
}

export function ModuleView({ active, records, onAdd, onDelete }: ModuleViewProps) {
  const Icon = sectionIcons[active] ?? LayoutDashboard;
  const config = moduleConfig[active] ?? moduleConfig.Calendrier;
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (active === "Calendrier") return <CalendarModule records={records} onAdd={onAdd} onDelete={onDelete} />;
  if (active === "Paiements") return <PaymentModule records={records} onAdd={onAdd} onDelete={onDelete} />;
  if (active === "Rapports") return <ReportsModule />;
  if (active === "Paramètres") return <SettingsModule />;
  if (active === "Notifications") return <NotificationsModule records={records} />;

  return (
    <>
      {lightboxImage && (
        <div
          className="modal-backdrop"
          onClick={() => setLightboxImage(null)}
          style={{ zIndex: 1000, background: "rgba(0, 0, 0, 0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: 0,
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage}
              alt="Agrandissement photo salle"
              style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: "12px", border: "2px solid var(--gold, #d4af37)", objectFit: "contain" }}
            />
          </div>
        </div>
      )}

      <section className="module-view">
        <div className="module-heading">
          <div>
            <div className="module-title">
              <Icon size={22} />
              <h1>{active}</h1>
            </div>
            <p>{config.description}</p>
          </div>
          <button className="primary-button" onClick={onAdd}>
            <Plus size={17} /> {config.addLabel}
          </button>
        </div>
        {records.length === 0 ? (
          <div className="module-empty">
            <Icon size={28} />
            <h2>{config.emptyTitle}</h2>
            <p>{config.emptyText}</p>
            <button className="primary-button" onClick={onAdd}>
              <Plus size={17} /> {config.addLabel}
            </button>
          </div>
        ) : (
          <div className="record-list">
            {records.map((record) => (
              <article className="record-row" key={record.id}>
                {record.image ? (
                  <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setLightboxImage(record.image ?? null)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={record.image} alt={record.title} className="record-thumbnail" />
                    <span
                      style={{
                        position: "absolute",
                        bottom: "2px",
                        right: "2px",
                        background: "rgba(0,0,0,0.6)",
                        color: "var(--gold)",
                        borderRadius: "4px",
                        padding: "2px",
                        display: "flex"
                      }}
                      title="Agrandir"
                    >
                      <Maximize2 size={10} />
                    </span>
                  </div>
                ) : active === "Salles" ? (
                  <div className="record-thumbnail-fallback">
                    <Icon size={22} />
                  </div>
                ) : null}
                <div className="record-row-main">
                  <strong>{record.title}</strong>
                  <span>{record.detail}</span>
                </div>
                <span className={`status ${record.status === "inactive" || record.status === "cancelled" || record.status === "archived" ? "status-annulée" : "status-confirmée"}`}>
                  {record.status}
                </span>

                <div style={{ display: "flex", gap: "6px" }}>
                  {active === "Contrats" && (
                    <button
                      className="icon-button"
                      title="Télécharger le contrat PDF officiel"
                      onClick={() => {
                        import("@/lib/pdf-generator").then((mod) => {
                          mod.generateContractPdf({
                            title: record.title,
                            contractNumber: record.detail.match(/Réf:\s*([^\s·]+)/)?.[1] || "CTR-2026",
                            status: record.status,
                            dateCreated: new Date().toLocaleDateString("fr-FR"),
                          });
                        });
                      }}
                      aria-label="Télécharger le contrat PDF"
                    >
                      <FileText size={16} />
                    </button>
                  )}
                  <button className="icon-button" onClick={() => onDelete(record.id)} aria-label="Supprimer">
                    <X size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
