import type { NextFunction, Request, Response } from "express";
import { pool } from "./db.js";
import { getSessionCookie, readSession, type AuthUser } from "./auth.js";

export const resourceNames = ["calendar", "halls", "reservations", "clients", "services", "payments", "contracts", "employees", "reports", "notifications", "settings"] as const;
export type ResourceName = typeof resourceNames[number];

export function isResourceName(value: string): value is ResourceName {
  return resourceNames.includes(value as ResourceName);
}

export async function requireUser(request: Request, response: Response, next: NextFunction) {
  const user = await readSession(getSessionCookie(request.headers.cookie));
  if (!user) {
    response.status(401).json({ error: "Non authentifié." });
    return;
  }
  response.locals.user = user satisfies AuthUser;
  next();
}

export async function listRecords(resource: ResourceName, organizationId: string) {
  const result = await pool.query(
    `SELECT id, title, detail, status, created_at FROM workspace_records WHERE resource = $1 AND organization_id = $2 ORDER BY created_at DESC`,
    [resource, organizationId]
  );
  return result.rows;
}

export async function createRecord(resource: ResourceName, userId: string, organizationId: string, title: string, detail = "Créé depuis VENORIA", status = "Actif") {
  const result = await pool.query(
    `INSERT INTO workspace_records (resource, owner_id, organization_id, title, detail, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, detail, status, created_at`,
    [resource, userId, organizationId, title, detail, status]
  );
  return result.rows[0];
}

export async function removeRecord(resource: ResourceName, userId: string, organizationId: string, id: string) {
  const result = await pool.query("DELETE FROM workspace_records WHERE id = $1 AND resource = $2 AND owner_id = $3 AND organization_id = $4 RETURNING id", [id, resource, userId, organizationId]);
  return result.rowCount === 1;
}
