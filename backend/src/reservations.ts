import { pool } from "./db.js";

export async function listReservations(organizationId: string, search = "") {
  const result = await pool.query(
    `SELECT r.id, r.title, r.event_type, r.starts_at, r.ends_at, r.guest_count, r.total_cents, r.status, r.notes, c.name AS client_name, h.name AS hall_name
     FROM reservations r
     LEFT JOIN clients c ON c.id = r.client_id
     LEFT JOIN halls h ON h.id = r.hall_id
     WHERE r.organization_id = $1 AND ($2 = '' OR r.title ILIKE '%' || $2 || '%' OR c.name ILIKE '%' || $2 || '%')
     ORDER BY r.starts_at DESC`,
    [organizationId, search.trim()]
  );
  return result.rows;
}

export async function createReservation(
  organizationId: string,
  input: {
    title: string;
    eventType?: string;
    startsAt: string;
    endsAt: string;
    guestCount: number;
    totalCents: number;
    clientId?: number;
    hallId?: number;
    notes?: string;
  }
) {
  const result = await pool.query(
    `INSERT INTO reservations (organization_id, title, event_type, starts_at, ends_at, guest_count, total_cents, client_id, hall_id, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, title, event_type, starts_at, ends_at, guest_count, total_cents, status, notes`,
    [
      organizationId,
      input.title,
      input.eventType ?? "Autre",
      input.startsAt,
      input.endsAt,
      input.guestCount,
      input.totalCents,
      input.clientId ?? null,
      input.hallId ?? null,
      input.notes ?? "",
    ]
  );
  return result.rows[0];
}

export async function cancelReservation(organizationId: string, id: string) {
  const result = await pool.query("UPDATE reservations SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND organization_id = $2 RETURNING id", [id, organizationId]);
  return result.rowCount === 1;
}