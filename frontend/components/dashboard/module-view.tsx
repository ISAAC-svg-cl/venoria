"use client";

import { LayoutDashboard, Plus, X } from "lucide-react";
import { navigation } from "./sidebar";
import { moduleConfig } from "./professional-modal";
import { PaymentModule } from "./payment-module";
import { ReportsModule } from "./reports-module";
import { SettingsModule } from "./settings-module";
import { NotificationsModule } from "./notifications-module";
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

  if (active === "Paiements") return <PaymentModule records={records} onAdd={onAdd} onDelete={onDelete} />;
  if (active === "Rapports") return <ReportsModule />;
  if (active === "Paramètres") return <SettingsModule />;
  if (active === "Notifications") return <NotificationsModule records={records} />;

  return (
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
                // eslint-disable-next-line @next/next/no-img-element
                <img src={record.image} alt={record.title} className="record-thumbnail" />
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
              <button className="icon-button" onClick={() => onDelete(record.id)} aria-label="Supprimer">
                <X size={17} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
