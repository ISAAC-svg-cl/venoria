import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workspace_records (
      id BIGSERIAL PRIMARY KEY,
      resource TEXT NOT NULL,
      owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Actif',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("ALTER TABLE workspace_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE");
  await pool.query("UPDATE workspace_records SET organization_id = users.organization_id FROM users WHERE workspace_records.owner_id = users.id AND workspace_records.organization_id IS NULL");
  await pool.query("CREATE INDEX IF NOT EXISTS workspace_records_owner_resource_idx ON workspace_records(owner_id, resource, created_at DESC)");
  await pool.query("CREATE INDEX IF NOT EXISTS workspace_records_organization_resource_idx ON workspace_records(organization_id, resource, created_at DESC)");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS halls (
      id BIGSERIAL PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', capacity INTEGER NOT NULL CHECK (capacity > 0),
      address TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '', postal_code TEXT NOT NULL DEFAULT '', country TEXT NOT NULL DEFAULT '',
      price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
      low_season_price_cents INTEGER NOT NULL DEFAULT 0 CHECK (low_season_price_cents >= 0),
      high_season_price_cents INTEGER NOT NULL DEFAULT 0 CHECK (high_season_price_cents >= 0),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE halls ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '';
    ALTER TABLE halls ADD COLUMN IF NOT EXISTS postal_code TEXT NOT NULL DEFAULT '';
    ALTER TABLE halls ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT '';
    ALTER TABLE halls ADD COLUMN IF NOT EXISTS low_season_price_cents INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE halls ADD COLUMN IF NOT EXISTS high_season_price_cents INTEGER NOT NULL DEFAULT 0;
    CREATE INDEX IF NOT EXISTS halls_organization_idx ON halls(organization_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS clients (
      id BIGSERIAL PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '', client_type TEXT NOT NULL DEFAULT 'Particulier', source TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '', country TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS company TEXT NOT NULL DEFAULT '';
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_type TEXT NOT NULL DEFAULT 'Particulier';
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT '';
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '';
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT '';
    CREATE INDEX IF NOT EXISTS clients_organization_idx ON clients(organization_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS services (
      id BIGSERIAL PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT 'Général',
      price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0), price_type TEXT NOT NULL DEFAULT 'Forfait',
      provider TEXT NOT NULL DEFAULT '', provider_phone TEXT NOT NULL DEFAULT '', provider_email TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Général';
    ALTER TABLE services ADD COLUMN IF NOT EXISTS price_type TEXT NOT NULL DEFAULT 'Forfait';
    ALTER TABLE services ADD COLUMN IF NOT EXISTS provider_phone TEXT NOT NULL DEFAULT '';
    ALTER TABLE services ADD COLUMN IF NOT EXISTS provider_email TEXT NOT NULL DEFAULT '';
    CREATE INDEX IF NOT EXISTS services_organization_idx ON services(organization_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS reservations (
      id BIGSERIAL PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL, hall_id BIGINT REFERENCES halls(id) ON DELETE SET NULL,
      title TEXT NOT NULL, event_type TEXT NOT NULL DEFAULT 'Autre', starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
      guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count > 0), total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'deposit_paid', 'completed', 'cancelled')),
      notes TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE reservations ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'Autre';
    CREATE INDEX IF NOT EXISTS reservations_organization_date_idx ON reservations(organization_id, starts_at);

    CREATE TABLE IF NOT EXISTS payments (
      id BIGSERIAL PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      reservation_id BIGINT REFERENCES reservations(id) ON DELETE SET NULL, client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0), method TEXT NOT NULL, reference TEXT NOT NULL DEFAULT '',
      paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'refunded')),
      notes TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS payments_organization_date_idx ON payments(organization_id, paid_at DESC);

    CREATE TABLE IF NOT EXISTS contracts (
      id BIGSERIAL PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      reservation_id BIGINT REFERENCES reservations(id) ON DELETE SET NULL, client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
      title TEXT NOT NULL, contract_number TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '',
      start_date DATE, end_date DATE,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'cancelled')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_number TEXT NOT NULL DEFAULT '';
    ALTER TABLE contracts ADD COLUMN IF NOT EXISTS start_date DATE;
    ALTER TABLE contracts ADD COLUMN IF NOT EXISTS end_date DATE;
    CREATE INDEX IF NOT EXISTS contracts_organization_idx ON contracts(organization_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS notifications (
      id BIGSERIAL PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '',
      read_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(organization_id, user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS organization_settings (
      organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
      data JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS employees (
      id UUID PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')),
      phone TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')), last_activity TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (organization_id, email)
    );
    ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
    CREATE INDEX IF NOT EXISTS employees_organization_idx ON employees(organization_id, created_at DESC);
  `);
}
