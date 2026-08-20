"use client";

import { Bell, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { RecordItem } from "./types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

export function NotificationsModule({ records }: { records: RecordItem[] }) {
  const [items, setItems] = useState(records);

  function markRead(id: string | number) {
    fetch(`${apiUrl}/api/notifications/${id}/read`, {
      method: "POST",
      credentials: "include",
    }).then((response) => {
      if (response.ok) {
        setItems((current) => current.filter((item) => item.id !== id));
      }
    });
  }

  return (
    <section className="module-view">
      <div className="module-heading">
        <div>
          <div className="module-title">
            <Bell size={22} />
            <h1>Notifications & Alertes</h1>
          </div>
          <p>Les alertes et rappels importants de votre organisation.</p>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="module-empty">
          <CheckCircle2 size={30} />
          <h2>Aucune notification en attente</h2>
          <p>Tout est parfaitement à jour dans votre espace.</p>
        </div>
      ) : (
        <div className="record-list">
          {items.map((item) => (
            <article className="record-row" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
              <button className="text-button" onClick={() => markRead(item.id)}>
                Marquer comme lu
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
