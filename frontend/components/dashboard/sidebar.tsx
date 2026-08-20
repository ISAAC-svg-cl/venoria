"use client";

import { Bell, FileText, Home, LayoutDashboard, LogOut, MoreHorizontal, Settings, Sparkles, Users, WalletCards, X, Activity, CalendarDays } from "lucide-react";
import type { Section } from "./types";

export const navigation = [
  ["Tableau de bord", LayoutDashboard],
  ["Calendrier", CalendarDays],
  ["Salles", Home],
  ["Réservations", CalendarDays],
  ["Clients", Users],
  ["Services", Sparkles],
  ["Paiements", WalletCards],
  ["Contrats", FileText],
  ["Employés", Users],
  ["Rapports", Activity],
] as const;

interface SidebarProps {
  open: boolean;
  close: () => void;
  logout: () => void;
  active: Section;
  select: (section: Section) => void;
  userName?: string;
  userRole?: string;
}

export function Sidebar({ open, close, logout, active, select, userName = "Clara Renard", userRole = "Administratrice" }: SidebarProps) {
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-top">
        <div className="brand-mark">
          <span>V</span>
          <strong>VENORIA</strong>
        </div>
        <button className="mobile-close" onClick={close} aria-label="Fermer le menu">
          <X size={20} />
        </button>
      </div>
      <p className="workspace-label">ESPACE ADMINISTRATEUR</p>
      <nav>
        {navigation.map(([label, Icon]) => (
          <button
            key={label}
            className={`nav-link ${active === label ? "active" : "future"}`}
            onClick={() => {
              select(label as Section);
              close();
            }}
          >
            <Icon size={18} />
            <span>{label}</span>
            {active !== label && <small>PRO</small>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button
          className={`nav-link ${active === "Notifications" ? "active" : "future"}`}
          onClick={() => {
            select("Notifications");
            close();
          }}
        >
          <Bell size={18} />
          <span>Notifications</span>
        </button>
        <button
          className={`nav-link ${active === "Paramètres" ? "active" : "future"}`}
          onClick={() => {
            select("Paramètres");
            close();
          }}
        >
          <Settings size={18} />
          <span>Paramètres</span>
        </button>
        <button className="nav-link logout" onClick={logout}>
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
        <div className="sidebar-profile">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{userName}</strong>
            <span>{userRole}</span>
          </div>
          <MoreHorizontal size={17} />
        </div>
      </div>
    </aside>
  );
}
