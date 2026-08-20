import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool: Pool | null = null;
let initialized = false;

export function getDbPool(): Pool | null {
  if (!connectionString) return null;
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      max: 10,
    });
  }
  return pool;
}

export async function initDb(): Promise<boolean> {
  const db = getDbPool();
  if (!db || initialized) return !!db;

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS halls (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        city TEXT DEFAULT '',
        address TEXT DEFAULT '',
        postal_code TEXT DEFAULT '',
        country TEXT DEFAULT 'France',
        price_cents INTEGER DEFAULT 0,
        low_season_price_cents INTEGER DEFAULT 0,
        high_season_price_cents INTEGER DEFAULT 0,
        images TEXT[] DEFAULT '{}',
        image TEXT DEFAULT '',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        company TEXT DEFAULT '',
        client_type TEXT DEFAULT 'Particulier',
        address TEXT DEFAULT '',
        city TEXT DEFAULT '',
        country TEXT DEFAULT '',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT DEFAULT 'Général',
        provider TEXT DEFAULT '',
        provider_phone TEXT DEFAULT '',
        provider_email TEXT DEFAULT '',
        price_cents INTEGER DEFAULT 0,
        price_type TEXT DEFAULT 'Forfait',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        event_type TEXT DEFAULT 'Autre',
        starts_at TIMESTAMPTZ NOT NULL,
        ends_at TIMESTAMPTZ NOT NULL,
        guest_count INTEGER DEFAULT 1,
        total_cents INTEGER DEFAULT 0,
        hall_id INTEGER,
        client_id INTEGER,
        status TEXT DEFAULT 'confirmed',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        reference TEXT NOT NULL,
        amount_cents INTEGER DEFAULT 0,
        method TEXT DEFAULT 'Virement bancaire',
        paid_at TIMESTAMPTZ DEFAULT NOW(),
        status TEXT DEFAULT 'confirmed',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        contract_number TEXT NOT NULL,
        start_date DATE,
        end_date DATE,
        status TEXT DEFAULT 'draft',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT DEFAULT '',
        role TEXT DEFAULT 'EMPLOYEE',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        detail TEXT DEFAULT '',
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    initialized = true;
    return true;
  } catch (err) {
    console.error("Database initialization error:", err);
    return false;
  }
}
