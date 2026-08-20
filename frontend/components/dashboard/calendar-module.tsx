"use client";

import { AlertTriangle, Calendar as CalendarIcon, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Filter, Layers, List, MapPin, Plus, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { RecordItem } from "./types";

interface CalendarModuleProps {
  records: RecordItem[];
  onAdd: () => void;
  onDelete: (id: string | number) => void;
}

type ViewMode = "month" | "week" | "agenda";

export function CalendarModule({ records, onAdd }: CalendarModuleProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDay, setSelectedDay] = useState<number | null>(() => new Date().getDate());
  const [filterType, setFilterType] = useState<string>("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }

  function today() {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(now.getDate());
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const isCurrentMonthToday = new Date().getMonth() === month && new Date().getFullYear() === year;
  const todayDateNum = new Date().getDate();

  // Parse records into dates
  const eventsByDay = useMemo(() => {
    const map: Record<number, RecordItem[]> = {};
    records.forEach((record) => {
      // Filter by type if active
      if (filterType !== "all" && !record.title.toLowerCase().includes(filterType.toLowerCase()) && !record.detail.toLowerCase().includes(filterType.toLowerCase())) {
        return;
      }

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
        const d = (typeof record.id === "number" ? record.id : 1) % daysInMonth + 1;
        if (!map[d]) map[d] = [];
        map[d].push(record);
      }
    });
    return map;
  }, [records, month, year, daysInMonth, filterType]);

  const conflicts = useMemo(() => {
    const list: Array<{ day: number; count: number; events: RecordItem[] }> = [];
    Object.entries(eventsByDay).forEach(([dayStr, evts]) => {
      if (evts.length > 1) {
        list.push({ day: parseInt(dayStr, 10), count: evts.length, events: evts });
      }
    });
    return list;
  }, [eventsByDay]);

  const totalEventsThisMonth = useMemo(() => {
    return Object.values(eventsByDay).reduce((acc, curr) => acc + curr.length, 0);
  }, [eventsByDay]);

  const selectedDayEvents = selectedDay ? eventsByDay[selectedDay] ?? [] : [];

  return (
    <section className="calendar-view">
      {/* Header with Title and Actions */}
      <div className="calendar-top-bar">
        <div className="calendar-title-wrap">
          <div className="calendar-icon-badge">
            <CalendarDays size={22} />
          </div>
          <div>
            <h1>Planning &amp; Calendrier Interactif</h1>
            <p>Supervisez l&apos;occupation des salles, gérez les dates de réception et détectez les chevauchements.</p>
          </div>
        </div>

        <div className="calendar-actions-wrap">
          <div className="view-mode-selector">
            <button
              type="button"
              className={viewMode === "month" ? "active" : ""}
              onClick={() => setViewMode("month")}
            >
              <CalendarIcon size={14} /> Mois
            </button>
            <button
              type="button"
              className={viewMode === "agenda" ? "active" : ""}
              onClick={() => setViewMode("agenda")}
            >
              <List size={14} /> Agenda
            </button>
          </div>

          <button type="button" className="secondary-button today-btn" onClick={today}>
            Aujourd&apos;hui
          </button>

          <button type="button" className="primary-button add-date-btn" onClick={onAdd}>
            <Plus size={16} /> Réserver une date
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="calendar-stats-row">
        <div className="cal-stat-card">
          <div className="cal-stat-icon gold"><Sparkles size={18} /></div>
          <div>
            <strong>{totalEventsThisMonth}</strong>
            <span>Événement(s) en {monthNames[month]}</span>
          </div>
        </div>
        <div className="cal-stat-card">
          <div className="cal-stat-icon green"><CheckCircle2 size={18} /></div>
          <div>
            <strong>{daysInMonth - Object.keys(eventsByDay).length}</strong>
            <span>Jours entièrement disponibles</span>
          </div>
        </div>
        <div className="cal-stat-card">
          <div className={`cal-stat-icon ${conflicts.length > 0 ? "rose" : "blue"}`}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <strong>{conflicts.length}</strong>
            <span>{conflicts.length > 0 ? "Conflit(s) à vérifier" : "Aucun chevauchement"}</span>
          </div>
        </div>
      </div>

      {/* Conflicts Alert Banner if any */}
      {conflicts.length > 0 && (
        <div className="calendar-conflict-banner" role="alert">
          <AlertTriangle size={20} className="conflict-icon" />
          <div style={{ flex: 1 }}>
            <strong>Attention : {conflicts.length} date(s) avec réservations multiples</strong>
            <p>
              Les jours suivants comptent plus d&apos;un événement : {conflicts.map((c) => `${c.day} ${monthNames[month]} (${c.count} réservations)`).join(", ")}.
            </p>
          </div>
        </div>
      )}

      {/* Month Navigation & Filters */}
      <div className="calendar-nav-bar">
        <div className="month-navigator">
          <button type="button" className="icon-button nav-arrow" onClick={prevMonth} aria-label="Mois précédent">
            <ChevronLeft size={20} />
          </button>
          <h2>{monthNames[month]} <span style={{ opacity: 0.75 }}>{year}</span></h2>
          <button type="button" className="icon-button nav-arrow" onClick={nextMonth} aria-label="Mois suivant">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="calendar-filter-pills">
          <span className="filter-label"><Filter size={13} /> Filtrer :</span>
          {["all", "Mariage", "Gala", "Anniversaire", "Séminaire"].map((type) => (
            <button
              key={type}
              type="button"
              className={`filter-pill ${filterType === type ? "active" : ""}`}
              onClick={() => setFilterType(type)}
            >
              {type === "all" ? "Tous les événements" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      {viewMode === "month" && (
        <div className="calendar-grid-container">
          <div className="calendar-weekdays-header">
            {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((dayName) => (
              <div key={dayName} className="weekday-col">
                <span className="weekday-long">{dayName}</span>
                <span className="weekday-short">{dayName.slice(0, 3)}</span>
              </div>
            ))}
          </div>

          <div className="calendar-days-grid">
            {/* Empty slots for month start */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day-cell empty" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = eventsByDay[day] ?? [];
              const isConflict = dayEvents.length > 1;
              const isToday = isCurrentMonthToday && todayDateNum === day;
              const isSelected = selectedDay === day;

              return (
                <div
                  key={`day-${day}`}
                  className={`calendar-day-cell ${dayEvents.length > 0 ? "has-events" : ""} ${isConflict ? "conflict" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedDay(day)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Jour ${day} ${monthNames[month]} - ${dayEvents.length} événements`}
                >
                  <div className="day-header">
                    <span className={`day-number ${isToday ? "today-badge" : ""}`}>{day}</span>
                    {isConflict && (
                      <span className="conflict-badge" title="Double réservation détectée">
                        <AlertTriangle size={11} /> {dayEvents.length}
                      </span>
                    )}
                    {!isConflict && dayEvents.length > 0 && (
                      <span className="event-count-dot">{dayEvents.length}</span>
                    )}
                  </div>

                  <div className="day-events-list">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div key={evt.id} className="calendar-event-tag" title={evt.title}>
                        <span className="event-tag-title">{evt.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="event-more-tag">+{dayEvents.length - 2} autres</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Details Panel */}
      {viewMode === "month" && selectedDay && (
        <div className="selected-day-panel">
          <div className="selected-day-header">
            <div>
              <h3>
                {selectedDay} {monthNames[month]} {year}
              </h3>
              <span>
                {selectedDayEvents.length === 0
                  ? "Aucun événement programmé ce jour — Salle disponible"
                  : `${selectedDayEvents.length} événement(s) enregistré(s)`}
              </span>
            </div>
            <button type="button" className="primary-button" onClick={onAdd}>
              <Plus size={15} /> Réserver pour le {selectedDay} {monthNames[month]}
            </button>
          </div>

          {selectedDayEvents.length > 0 && (
            <div className="selected-day-events-grid">
              {selectedDayEvents.map((evt) => (
                <article key={evt.id} className="event-detail-card">
                  <div className="event-detail-top">
                    <strong>{evt.title}</strong>
                    <span className={`status ${evt.status === "confirmed" ? "status-confirmée" : "status-annulée"}`}>
                      {evt.status}
                    </span>
                  </div>
                  <p className="event-detail-desc">{evt.detail}</p>
                  <div className="event-detail-meta">
                    <span><Clock size={13} /> Horaires &amp; Créneau confirmés</span>
                    <span><Users size={13} /> Invités enregistrés</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Agenda / List View */}
      {viewMode === "agenda" && (
        <div className="calendar-agenda-view">
          {records.length === 0 ? (
            <div className="module-empty">
              <CalendarDays size={32} />
              <h2>Aucune réservation dans l&apos;agenda</h2>
              <p>Votre planning est actuellement libre. Ajoutez votre premier événement pour commencer.</p>
              <button className="primary-button" onClick={onAdd}>
                <Plus size={16} /> Planifier un événement
              </button>
            </div>
          ) : (
            <div className="agenda-list">
              {records.map((record) => (
                <article className="agenda-row" key={record.id}>
                  <div className="agenda-date-badge">
                    <CalendarDays size={18} />
                  </div>
                  <div className="agenda-main">
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
        </div>
      )}
    </section>
  );
}
