import { pool } from "./db.js";

export async function listPayments(organizationId: string) {
  const result = await pool.query(
    `SELECT p.id, p.amount_cents, p.method, p.reference, p.paid_at, p.status, p.notes, c.name AS client_name, r.title AS reservation_title
     FROM payments p
     LEFT JOIN clients c ON c.id = p.client_id
     LEFT JOIN reservations r ON r.id = p.reservation_id
     WHERE p.organization_id = $1
     ORDER BY p.paid_at DESC`,
    [organizationId]
  );
  return result.rows;
}

export async function createPayment(
  organizationId: string,
  input: { amountCents: number; method: string; reference: string; paidAt: string; notes: string }
) {
  const result = await pool.query(
    `INSERT INTO payments (organization_id, amount_cents, method, reference, paid_at, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, amount_cents, method, reference, paid_at, status`,
    [organizationId, input.amountCents, input.method, input.reference, input.paidAt, input.notes]
  );
  return result.rows[0];
}

export async function refundPayment(organizationId: string, id: string) {
  const result = await pool.query("UPDATE payments SET status = 'refunded' WHERE id = $1 AND organization_id = $2 RETURNING id", [id, organizationId]);
  return result.rowCount === 1;
}

export async function listContracts(organizationId: string) {
  const result = await pool.query(
    `SELECT id, title, contract_number, content, start_date, end_date, status, created_at, updated_at
     FROM contracts
     WHERE organization_id = $1
     ORDER BY created_at DESC`,
    [organizationId]
  );
  return result.rows;
}

export async function createContract(
  organizationId: string,
  input: {
    title: string;
    contractNumber?: string;
    content?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }
) {
  const result = await pool.query(
    `INSERT INTO contracts (organization_id, title, contract_number, content, start_date, end_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, contract_number, content, start_date, end_date, status, created_at, updated_at`,
    [
      organizationId,
      input.title,
      input.contractNumber ?? "",
      input.content ?? "",
      input.startDate || null,
      input.endDate || null,
      input.status ?? "draft",
    ]
  );
  return result.rows[0];
}

export async function updateContractStatus(organizationId: string, id: string, status: string) {
  const result = await pool.query(
    "UPDATE contracts SET status = $1, updated_at = NOW() WHERE id = $2 AND organization_id = $3 RETURNING id, status",
    [status, id, organizationId]
  );
  return result.rows[0];
}