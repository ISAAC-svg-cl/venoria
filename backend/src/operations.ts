import { pool } from "./db.js";
import { randomUUID } from "node:crypto";

const roles = ["OWNER", "ADMIN", "MANAGER", "EMPLOYEE"] as const;
export type Role = typeof roles[number];
export function isRole(value: string): value is Role { return roles.includes(value as Role); }
export function canManageUsers(role: string) { return role === "OWNER" || role === "ADMIN"; }
export async function listEmployees(organizationId: string) {
  const result = await pool.query(
    "SELECT id, name, email, phone, role, status, last_activity, created_at FROM employees WHERE organization_id = $1 ORDER BY created_at DESC",
    [organizationId]
  );
  return result.rows;
}
export async function createEmployee(organizationId: string, input: { name: string; email: string; role: Role; phone?: string }) {
  const result = await pool.query(
    "INSERT INTO employees (id, organization_id, name, email, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, role, status, last_activity, created_at",
    [randomUUID(), organizationId, input.name, input.email, input.phone ?? "", input.role]
  );
  return result.rows[0];
}
export async function deactivateEmployee(organizationId: string, id: string) {
  const result = await pool.query("UPDATE employees SET status = 'inactive' WHERE id = $1 AND organization_id = $2 RETURNING id", [id, organizationId]);
  return result.rowCount === 1;
}

export async function listNotifications(organizationId: string, userId: string) { const result = await pool.query("SELECT id, title, detail, read_at, created_at FROM notifications WHERE organization_id = $1 AND (user_id = $2 OR user_id IS NULL) ORDER BY created_at DESC", [organizationId, userId]); return result.rows; }
export async function markNotificationRead(organizationId: string, userId: string, id: string) { const result = await pool.query("UPDATE notifications SET read_at = NOW() WHERE id = $1 AND organization_id = $2 AND (user_id = $3 OR user_id IS NULL) RETURNING id", [id, organizationId, userId]); return result.rowCount === 1; }
export async function getSettings(organizationId: string) { const result = await pool.query("SELECT data, updated_at FROM organization_settings WHERE organization_id = $1", [organizationId]); return result.rows[0] ?? { data: {}, updated_at: null }; }
export async function updateSettings(organizationId: string, data: Record<string, unknown>) { const result = await pool.query("INSERT INTO organization_settings (organization_id, data) VALUES ($1, $2) ON CONFLICT (organization_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW() RETURNING data, updated_at", [organizationId, JSON.stringify(data)]); return result.rows[0]; }
export async function reportSummary(organizationId: string) { const result = await pool.query(`SELECT (SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE organization_id = $1 AND status = 'confirmed') AS revenue_cents, (SELECT COUNT(*) FROM reservations WHERE organization_id = $1 AND status <> 'cancelled') AS reservations, (SELECT COUNT(*) FROM clients WHERE organization_id = $1 AND status = 'active') AS clients, (SELECT COUNT(*) FROM payments WHERE organization_id = $1) AS payments, (SELECT COUNT(*) FROM halls WHERE organization_id = $1 AND status = 'active') AS halls`, [organizationId]); return result.rows[0]; }