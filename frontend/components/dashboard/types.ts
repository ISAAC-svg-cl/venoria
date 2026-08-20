import { ComponentType } from "react";

export type Section =
  | "Tableau de bord"
  | "Calendrier"
  | "Salles"
  | "Réservations"
  | "Clients"
  | "Services"
  | "Paiements"
  | "Contrats"
  | "Employés"
  | "Rapports"
  | "Notifications"
  | "Paramètres";

export type RecordItem = {
  id: string | number;
  title: string;
  detail: string;
  status: string;
  image?: string;
};

export type StatItem = readonly [
  label: string,
  value: string,
  Icon: ComponentType<{ size?: number; className?: string }>,
  tone: "green" | "gold" | "blue" | "rose"
];

export type ModuleConfig = {
  description: string;
  emptyTitle: string;
  emptyText: string;
  addLabel: string;
  fieldLabel: string;
  placeholder: string;
};
