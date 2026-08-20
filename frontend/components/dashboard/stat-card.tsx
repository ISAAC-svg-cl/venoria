"use client";

import { MoreHorizontal } from "lucide-react";
import type { StatItem } from "./types";

export function StatCard({ item }: { item: StatItem }) {
  const [label, value, Icon, tone] = item;
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={18} />
      </div>
      <div className="stat-info">
        <span>{label}</span>
        <strong>{value}</strong>
        <small className="positive">
          0 % <em>vs période précédente</em>
        </small>
      </div>
      <MoreHorizontal className="stat-more" size={18} />
    </article>
  );
}
