"use client";

import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { RecordItem } from "./types";

interface CalendarModuleProps {
  records: RecordItem[];
  onAdd: () => void;
  onDelete: (id: string | number) => void;
}

export function CalendarModule({ records, onAdd }: CalendarModuleProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function today() {
    setCurrentDate(new Date());
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  // Conflict detection: detect if there are multiple bookings on same day
  const eventsByDay = useMemo(() => {
    const map: Record<number, RecordItem[]> = {};
    records.forEach((record) => {
      // Extract date if present in detail
      const match = record.detail.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (match) {
        const d = parseInt(match[1], 10);
        const m = parseInt(match[2], 10) - 1;
        const y = parseInt(match[3], 10);
        if (m === month && y === year) {
          if (!map[d]) map[d] = [];
          map[d].push(record);
        }
      } else {
        // Distribute or fallback to day 1-28 for demo/unformatted items
        const d = (typeof record.id === "number" ? record.id : 1) % daysInMonth + 1;
        if (!map[d]) map[d] = [];
        map[d].push(record);
      }
    });
    return map;
  }, [records, month, year, daysInMonth]);

  const conflicts = useMemo(() => {
    const list: Array<{ day: number; count: number }> = [];
    Object.entries(eventsByDay).forEach(([dayStr, evts]) => {
      if (evts.length > 1) {
        list.push({ day: parseInt(dayStr, 10), count: evts.length });
      }
    });
    return list;
  }, [eventsByDay]);

  return (
    <section className="module-view calendar-module">
      <div className="module-heading">
        <div>
          <div className="module-title">
            <CalendarDays size={22} />
            <h1>Planning &amp; Calendrier des Salles</h1>
          </div>
          <p>Supervisez les disponibilités, les réceptions en cours et détectez les conflits de dates.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="secondary-button" onClick={today}>
            Aujourd&apos;hui
          </button>
          <button className="primary-button" onClick={onAdd}>
            <Plus size={17} /> Réserver une date
          </button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div style={{
          background: "rgba(225, 29, 72, 0.15)",
          border: "1px solid rgba(225, 29, 72, 0.4)",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#fda4af"
        }}>
          <AlertTriangle size={18} />
          <span>
            <strong>Attention : {conflicts.length} chevauchement(s) détecté(s)</strong> ce mois-ci (jours : {conflicts.map(c => `${c.day} ${monthNames[month]}`).join(", ")}). Vérifiez la disponibilité des salles.
          </span>
        </div>
      )}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
        background: "rgba(20, 44, 38, 0.3)",
        padding: "10px 16px",
        borderRadius: "12px",
        border: "1px solid rgba(212, 175, 55, 0.2)"
      }}>
        <h2 style={{ margin: 0, fontSize: "17px", color: "var(--gold, #d4af37)" }}>
          {monthNames[month]} {year}
        </h2>
        <div style={{ display: "flex", gap: "6px" }}>
          <button className="icon-button" onClick={prevMonth} aria-label="Mois précédent">
            <ChevronLeft size={18} />
          </button>
          <button className="icon-button" onClick={nextMonth} aria-label="Mois suivant">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "8px",
        marginBottom: "16px"
      }}>
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
          <div key={d} style={{
            textAlign: "center",
            fontWeight: "700",
            fontSize: "12px",
            opacity: 0.7,
            padding: "6px 0"
          }}>
            {d}
          </div>
        ))}

        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} style={{
            minHeight: "85px",
            background: "rgba(0,0,0,0.1)",
            borderRadius: "8px",
            opacity: 0.3
          }} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = eventsByDay[day] ?? [];
          const isConflict = dayEvents.length > 1;

          return (
            <div
              key={`day-${day}`}
              style={{
                minHeight: "95px",
                background: isConflict
                  ? "rgba(225, 29, 72, 0.1)"
                  : dayEvents.length > 0
                  ? "rgba(20, 44, 38, 0.5)"
                  : "rgba(255, 255, 255, 0.03)",
                border: isConflict
                  ? "1px solid rgba(225, 29, 72, 0.5)"
                  : dayEvents.length > 0
                  ? "1px solid rgba(212, 175, 55, 0.4)"
                  : "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "10px",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                transition: "all 0.2s"
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{
                  fontWeight: "700",
                  fontSize: "12px",
                  color: dayEvents.length > 0 ? "var(--gold, #d4af37)" : "inherit"
                }}>
                  {day}
                </span>
                {isConflict && (
                  <span title="Conflit de date" style={{ color: "#f43f5e", fontSize: "11px" }}>
                    <AlertTriangle size={13} />
                  </span>
                )}
              </div>

              {dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    background: "rgba(212, 175, 55, 0.15)",
                    borderLeft: "3px solid var(--gold, #d4af37)",
                    borderRadius: "4px",
                    padding: "3px 6px",
                    fontSize: "10px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                  title={`${evt.title} · ${evt.detail}`}
                >
                  <strong>{evt.title}</strong>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {records.length === 0 ? (
        <div className="module-empty">
          <CalendarDays size={28} />
          <h2>Aucun événement planifié</h2>
          <p>Réservez une salle ou ajoutez un événement pour l&apos;afficher sur le calendrier.</p>
          <button className="primary-button" onClick={onAdd}>
            <Plus size={17} /> Planifier un événement
          </button>
        </div>
      ) : (
        <div className="record-list">
          <h3 style={{ fontSize: "14px", margin: "16px 0 8px 0" }}>Liste des réservations du calendrier</h3>
          {records.map((record) => (
            <article className="record-row" key={record.id}>
              <div className="record-thumbnail-fallback">
                <Clock size={20} />
              </div>
              <div className="record-row-main">
                <strong>{record.title}</strong>
                <span>{record.detail}</span>
              </div>
              <span className={`status ${record.status === "confirmed" ? "status-confirmée" : "status-annulée"}`}>
                {record.status}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
