import { pool } from "./db.js";

export async function listHalls(organizationId: string) {
  const result = await pool.query(
    "SELECT id, name, description, capacity, address, city, postal_code, country, price_cents, low_season_price_cents, high_season_price_cents, status, created_at FROM halls WHERE organization_id = $1 ORDER BY created_at DESC",
    [organizationId]
  );
  return result.rows;
}

export async function createHall(
  organizationId: string,
  input: {
    name: string;
    capacity: number;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    priceCents: number;
    lowSeasonPriceCents?: number;
    highSeasonPriceCents?: number;
  }
) {
  const result = await pool.query(
    `INSERT INTO halls (organization_id, name, capacity, address, city, postal_code, country, price_cents, low_season_price_cents, high_season_price_cents)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, name, description, capacity, address, city, postal_code, country, price_cents, low_season_price_cents, high_season_price_cents, status, created_at`,
    [
      organizationId,
      input.name,
      input.capacity,
      input.address ?? "",
      input.city ?? "",
      input.postalCode ?? "",
      input.country ?? "",
      input.priceCents,
      input.lowSeasonPriceCents ?? 0,
      input.highSeasonPriceCents ?? 0,
    ]
  );
  return result.rows[0];
}

export async function deleteHall(organizationId: string, id: string) {
  const result = await pool.query("UPDATE halls SET status = 'inactive' WHERE id = $1 AND organization_id = $2 RETURNING id", [id, organizationId]);
  return result.rowCount === 1;
}

export async function listClients(organizationId: string) {
  const result = await pool.query(
    "SELECT id, name, email, phone, company, client_type, source, address, city, country, notes, status, created_at FROM clients WHERE organization_id = $1 ORDER BY created_at DESC",
    [organizationId]
  );
  return result.rows;
}

export async function createClient(
  organizationId: string,
  input: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    clientType?: string;
    source?: string;
    address?: string;
    city?: string;
    country?: string;
    notes?: string;
  }
) {
  const result = await pool.query(
    `INSERT INTO clients (organization_id, name, email, phone, company, client_type, source, address, city, country, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, name, email, phone, company, client_type, source, address, city, country, notes, status, created_at`,
    [
      organizationId,
      input.name,
      input.email ?? "",
      input.phone ?? "",
      input.company ?? "",
      input.clientType ?? "Particulier",
      input.source ?? "",
      input.address ?? "",
      input.city ?? "",
      input.country ?? "",
      input.notes ?? "",
    ]
  );
  return result.rows[0];
}

export async function deleteClient(organizationId: string, id: string) {
  const result = await pool.query("UPDATE clients SET status = 'archived' WHERE id = $1 AND organization_id = $2 RETURNING id", [id, organizationId]);
  return result.rowCount === 1;
}

export async function listServices(organizationId: string) {
  const result = await pool.query(
    "SELECT id, name, description, category, price_cents, price_type, provider, provider_phone, provider_email, status, created_at FROM services WHERE organization_id = $1 ORDER BY created_at DESC",
    [organizationId]
  );
  return result.rows;
}

export async function createService(
  organizationId: string,
  input: {
    name: string;
    category?: string;
    priceCents: number;
    priceType?: string;
    provider?: string;
    providerPhone?: string;
    providerEmail?: string;
  }
) {
  const result = await pool.query(
    `INSERT INTO services (organization_id, name, category, price_cents, price_type, provider, provider_phone, provider_email)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, description, category, price_cents, price_type, provider, provider_phone, provider_email, status, created_at`,
    [
      organizationId,
      input.name,
      input.category ?? "Général",
      input.priceCents,
      input.priceType ?? "Forfait",
      input.provider ?? "",
      input.providerPhone ?? "",
      input.providerEmail ?? "",
    ]
  );
  return result.rows[0];
}

export async function deleteService(organizationId: string, id: string) {
  const result = await pool.query("UPDATE services SET status = 'inactive' WHERE id = $1 AND organization_id = $2 RETURNING id", [id, organizationId]);
  return result.rowCount === 1;
}