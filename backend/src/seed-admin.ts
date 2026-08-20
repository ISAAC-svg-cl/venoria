import { randomUUID } from "node:crypto";
import { pool } from "./db.js";
import { hashPassword } from "./auth.js";

export async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@gmail.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "admin123");
  if (!password) throw new Error("ADMIN_PASSWORD est obligatoire en production");
  const passwordHash = await hashPassword(password);
  const organizationId = randomUUID();
  await pool.query(`INSERT INTO organizations (id, name, slug) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING`, [organizationId, "VENORIA", "venoria"]);
  const organization = await pool.query("SELECT id FROM organizations WHERE slug = 'venoria' LIMIT 1");
  await pool.query(
    `INSERT INTO users (id, organization_id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5, 'OWNER') ON CONFLICT (email) DO UPDATE SET organization_id = EXCLUDED.organization_id`,
    [randomUUID(), organization.rows[0].id, email, passwordHash, process.env.ADMIN_NAME ?? "Administrateur VENORIA"]
  );
}
