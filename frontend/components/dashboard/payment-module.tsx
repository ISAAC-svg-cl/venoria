"use client";

import { CreditCard, Plus, X } from "lucide-react";
import type { RecordItem } from "./types";

interface PaymentModuleProps {
  records: RecordItem[];
  onAdd: () => void;
  onDelete: (id: string | number) => void;
}

export function PaymentModule({ records, onAdd, onDelete }: PaymentModuleProps) {
  const confirmed = records.filter((record) => record.status === "confirmed" || record.status === "Confirmé").length;

  return (
    <section className="module-view payment-module">
      <div className="module-heading">
        <div>
          <div className="module-title">
            <CreditCard size={22} />
            <h1>Paiements & Encaissements</h1>
          </div>
          <p>Suivez les acomptes, soldes et transactions de vos réservations.</p>
        </div>
        <button className="primary-button" onClick={onAdd}>
          <Plus size={17} /> Enregistrer un paiement
        </button>
      </div>
      <div className="payment-summary">
        <div>
          <span>Total transactions</span>
          <strong>{records.length}</strong>
          <small>Enregistrées en base</small>
        </div>
        <div>
          <span>Paiements confirmés</span>
          <strong>{confirmed}</strong>
          <small>Validés et sécurisés</small>
        </div>
        <div>
          <span>En attente / remboursés</span>
          <strong>{records.length - confirmed}</strong>
          <small>À régulariser</small>
        </div>
      </div>
      {records.length === 0 ? (
        <div className="module-empty">
          <CreditCard size={30} />
          <h2>Aucun paiement enregistré</h2>
          <p>Les acomptes et règlements de vos réservations apparaîtront ici.</p>
          <button className="primary-button" onClick={onAdd}>
            <Plus size={17} /> Enregistrer le premier paiement
          </button>
        </div>
      ) : (
        <div className="payment-table">
          <div className="payment-table-head">
            <span>Référence</span>
            <span>Détail</span>
            <span>Statut</span>
            <span>Action</span>
          </div>
          {records.map((record) => (
            <div className="payment-table-row" key={record.id}>
              <strong>{record.title}</strong>
              <span>{record.detail}</span>
              <span className={`status ${record.status === "refunded" ? "status-annulée" : "status-confirmée"}`}>
                {record.status}
              </span>
              <button
                className="icon-button"
                onClick={() => onDelete(record.id)}
                aria-label="Supprimer / Rembourser le paiement"
              >
                <X size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
