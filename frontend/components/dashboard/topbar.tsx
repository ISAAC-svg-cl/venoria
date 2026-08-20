"use client";

import { Bell, ChevronDown, Globe2, Menu, MessageSquare, Moon, Search, Sun } from "lucide-react";
import type { Section } from "./types";

interface TopbarProps {
  onOpenMenu: () => void;
  language: "FR" | "EN";
  onToggleLanguage: () => void;
  onSelectSection: (section: Section) => void;
  dark: boolean;
  onToggleDark: () => void;
  onNotify: (msg: string) => void;
  userName?: string;
  userRole?: string;
}

export function Topbar({
  onOpenMenu,
  language,
  onToggleLanguage,
  onSelectSection,
  dark,
  onToggleDark,
  onNotify,
  userName = "Clara Renard",
  userRole = "Administratrice",
}: TopbarProps) {
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <header className="topbar">
      <button className="menu-button" onClick={onOpenMenu} aria-label="Ouvrir le menu">
        <Menu size={21} />
      </button>
      <div className="global-search">
        <Search size={18} />
        <input
          placeholder={language === "FR" ? "Rechercher dans VENORIA..." : "Search VENORIA..."}
          onChange={(event) => event.target.value && onNotify(`Recherche : ${event.target.value}`)}
        />
        <kbd>⌘ K</kbd>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" onClick={onToggleLanguage}>
          <Globe2 size={18} />
          <span>{language}</span>
          <ChevronDown size={14} />
        </button>
        <button className="icon-button" onClick={() => onNotify("Messagerie en temps réel synchronisée.")}>
          <MessageSquare size={19} />
        </button>
        <button className="icon-button" onClick={() => onSelectSection("Notifications")}>
          <Bell size={19} />
        </button>
        <button className="icon-button" onClick={onToggleDark} aria-label="Changer le thème">
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <button className="top-profile" onClick={() => onSelectSection("Paramètres")}>
          <div className="avatar">{initials}</div>
          <div>
            <strong>{userName}</strong>
            <span>{userRole}</span>
          </div>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}
