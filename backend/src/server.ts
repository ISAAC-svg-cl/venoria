import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { comparePassword, clearSessionCookie, createSession, getSessionCookie, readSession, setSessionCookie } from "./auth.js";
import { pool, initializeDatabase } from "./db.js";
import { ensureAdmin } from "./seed-admin.js";
import { loginSchema } from "./validation.js";
import { createRecord, isResourceName, listRecords, removeRecord, requireUser } from "./records.js";
import { createClient, createHall, createService, deleteClient, deleteHall, deleteService, listClients, listHalls, listServices } from "./domain.js";
import { cancelReservation, createReservation, listReservations } from "./reservations.js";
import { createContract, createPayment, listContracts, listPayments, refundPayment, updateContractStatus } from "./finance.js";
import { canManageUsers, createEmployee, deactivateEmployee, getSettings, isRole, listEmployees, listNotifications, markNotificationRead, reportSummary, updateSettings } from "./operations.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const param = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

// Rate limiting on login to protect against brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/health", async (_request, response) => {
  try {
    await pool.query("SELECT 1");
    response.json({ status: "ok", service: "venoria-backend", database: "connected" });
  } catch (error) {
    response.status(503).json({ status: "error", service: "venoria-backend", database: "disconnected" });
  }
});

app.post("/api/auth/login", loginLimiter, async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Email ou mot de passe invalide." });
    return;
  }
  const result = await pool.query(
    "SELECT id, organization_id, email, name, role, password_hash FROM users WHERE email = $1 LIMIT 1",
    [parsed.data.email.toLowerCase()]
  );
  const user = result.rows[0] as
    | { id: string; organization_id: string; email: string; name: string; role: string; password_hash: string }
    | undefined;
  if (!user || !(await comparePassword(parsed.data.password, user.password_hash))) {
    response.status(401).json({ error: "Identifiants incorrects." });
    return;
  }
  const session = await createSession({
    id: user.id,
    organizationId: user.organization_id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  response.setHeader("Set-Cookie", setSessionCookie(session));
  response.json({ user: { id: user.id, organizationId: user.organization_id, email: user.email, name: user.name, role: user.role } });
});

app.post("/api/auth/logout", (_request, response) => {
  response.setHeader("Set-Cookie", clearSessionCookie());
  response.status(204).send();
});

app.get("/api/auth/me", async (request, response) => {
  const user = await readSession(getSessionCookie(request.headers.cookie));
  if (!user) {
    response.status(401).json({ error: "Non authentifié." });
    return;
  }
  response.json({ user });
});

app.get("/api/:resource", requireUser, async (request, response, next) => {
  const resource = param(request.params.resource);
  if (["halls", "clients", "services", "reservations", "payments", "contracts", "notifications", "settings", "reports", "employees"].includes(resource)) {
    next();
    return;
  }
  if (!isResourceName(resource)) {
    response.status(404).json({ error: "Ressource inconnue." });
    return;
  }
  const records = await listRecords(resource, response.locals.user.organizationId);
  response.json({ records });
});

app.post("/api/:resource", requireUser, async (request, response, next) => {
  const resource = param(request.params.resource);
  if (["halls", "clients", "services", "reservations", "payments", "contracts", "notifications", "settings", "reports", "employees"].includes(resource)) {
    next();
    return;
  }
  if (!isResourceName(resource)) {
    response.status(404).json({ error: "Ressource inconnue." });
    return;
  }
  const title = typeof request.body?.title === "string" ? request.body.title.trim() : "";
  if (!title || title.length > 180) {
    response.status(400).json({ error: "Un nom valide est obligatoire." });
    return;
  }
  const detail = typeof request.body?.detail === "string" ? request.body.detail.trim().slice(0, 240) : "Créé depuis VENORIA";
  const status = typeof request.body?.status === "string" ? request.body.status.trim().slice(0, 40) : "Actif";
  const record = await createRecord(resource, response.locals.user.id, response.locals.user.organizationId, title, detail, status);
  response.status(201).json({ record });
});

app.delete("/api/:resource/:id", requireUser, async (request, response, next) => {
  const resource = param(request.params.resource);
  const id = param(request.params.id);
  if (["halls", "clients", "services", "reservations", "payments", "contracts", "notifications", "settings", "reports", "employees"].includes(resource)) {
    next();
    return;
  }
  if (!isResourceName(resource)) {
    response.status(404).json({ error: "Ressource inconnue." });
    return;
  }
  const removed = await removeRecord(resource, response.locals.user.id, response.locals.user.organizationId, id);
  if (!removed) {
    response.status(404).json({ error: "Élément introuvable." });
    return;
  }
  response.status(204).send();
});

// Salles
app.get("/api/halls", requireUser, async (_request, response) => {
  response.json({ halls: await listHalls(response.locals.user.organizationId) });
});

app.post("/api/halls", requireUser, async (request, response) => {
  const { name, capacity, address = "", city = "", postalCode = "", country = "", priceCents = 0, lowSeasonPriceCents = 0, highSeasonPriceCents = 0 } = request.body ?? {};
  if (typeof name !== "string" || !name.trim() || !Number.isInteger(Number(capacity)) || Number(capacity) <= 0 || Number(priceCents) < 0) {
    response.status(400).json({ error: "Nom, capacité et tarif valides requis." });
    return;
  }
  const hall = await createHall(response.locals.user.organizationId, {
    name: name.trim(),
    capacity: Number(capacity),
    address: String(address).trim(),
    city: String(city).trim(),
    postalCode: String(postalCode).trim(),
    country: String(country).trim(),
    priceCents: Number(priceCents),
    lowSeasonPriceCents: Number(lowSeasonPriceCents) || 0,
    highSeasonPriceCents: Number(highSeasonPriceCents) || 0,
  });
  response.status(201).json({ hall });
});

app.delete("/api/halls/:id", requireUser, async (request, response) => {
  if (!canManageUsers(response.locals.user.role)) {
    response.status(403).json({ error: "Permission insuffisante pour supprimer une salle." });
    return;
  }
  if (!(await deleteHall(response.locals.user.organizationId, param(request.params.id)))) {
    response.status(404).json({ error: "Salle introuvable." });
    return;
  }
  response.status(204).send();
});

// Clients
app.get("/api/clients", requireUser, async (_request, response) => {
  response.json({ clients: await listClients(response.locals.user.organizationId) });
});

app.post("/api/clients", requireUser, async (request, response) => {
  const { name, email = "", phone = "", company = "", clientType = "Particulier", source = "", address = "", city = "", country = "", notes = "" } = request.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    response.status(400).json({ error: "Le nom du client est obligatoire." });
    return;
  }
  const client = await createClient(response.locals.user.organizationId, {
    name: name.trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    company: String(company).trim(),
    clientType: String(clientType).trim(),
    source: String(source).trim(),
    address: String(address).trim(),
    city: String(city).trim(),
    country: String(country).trim(),
    notes: String(notes).trim(),
  });
  response.status(201).json({ client });
});

app.delete("/api/clients/:id", requireUser, async (request, response) => {
  if (!(await deleteClient(response.locals.user.organizationId, param(request.params.id)))) {
    response.status(404).json({ error: "Client introuvable." });
    return;
  }
  response.status(204).send();
});

// Services
app.get("/api/services", requireUser, async (_request, response) => {
  response.json({ services: await listServices(response.locals.user.organizationId) });
});

app.post("/api/services", requireUser, async (request, response) => {
  const { name, category = "Général", priceCents = 0, priceType = "Forfait", provider = "", providerPhone = "", providerEmail = "" } = request.body ?? {};
  if (typeof name !== "string" || !name.trim() || Number(priceCents) < 0) {
    response.status(400).json({ error: "Nom et tarif valides requis." });
    return;
  }
  const service = await createService(response.locals.user.organizationId, {
    name: name.trim(),
    category: String(category).trim(),
    priceCents: Number(priceCents),
    priceType: String(priceType).trim(),
    provider: String(provider).trim(),
    providerPhone: String(providerPhone).trim(),
    providerEmail: String(providerEmail).trim(),
  });
  response.status(201).json({ service });
});

app.delete("/api/services/:id", requireUser, async (request, response) => {
  if (!(await deleteService(response.locals.user.organizationId, param(request.params.id)))) {
    response.status(404).json({ error: "Service introuvable." });
    return;
  }
  response.status(204).send();
});

// Réservations
app.get("/api/reservations", requireUser, async (request, response) => {
  response.json({
    reservations: await listReservations(
      response.locals.user.organizationId,
      typeof request.query.search === "string" ? request.query.search : ""
    ),
  });
});

app.post("/api/reservations", requireUser, async (request, response) => {
  const { title, eventType = "Autre", startsAt, endsAt, guestCount = 1, totalCents = 0, clientId, hallId, notes = "" } = request.body ?? {};
  if (
    typeof title !== "string" ||
    !title.trim() ||
    !startsAt ||
    !endsAt ||
    new Date(endsAt) <= new Date(startsAt) ||
    !Number.isInteger(Number(guestCount)) ||
    Number(guestCount) < 1 ||
    Number(totalCents) < 0
  ) {
    response.status(400).json({ error: "Les informations de réservation sont invalides." });
    return;
  }
  const reservation = await createReservation(response.locals.user.organizationId, {
    title: title.trim(),
    eventType: String(eventType).trim(),
    startsAt,
    endsAt,
    guestCount: Number(guestCount),
    totalCents: Number(totalCents),
    clientId: clientId ? Number(clientId) : undefined,
    hallId: hallId ? Number(hallId) : undefined,
    notes: String(notes).trim(),
  });
  response.status(201).json({ reservation });
});

app.delete("/api/reservations/:id", requireUser, async (request, response) => {
  if (!(await cancelReservation(response.locals.user.organizationId, param(request.params.id)))) {
    response.status(404).json({ error: "Réservation introuvable." });
    return;
  }
  response.status(204).send();
});

// Paiements
app.get("/api/payments", requireUser, async (_request, response) => {
  response.json({ payments: await listPayments(response.locals.user.organizationId) });
});

app.post("/api/payments", requireUser, async (request, response) => {
  const { amountCents, method, reference = "", paidAt, notes = "" } = request.body ?? {};
  if (!Number.isInteger(Number(amountCents)) || Number(amountCents) <= 0 || typeof method !== "string" || !method.trim() || !paidAt || Number.isNaN(new Date(paidAt).getTime())) {
    response.status(400).json({ error: "Montant, méthode et date de paiement valides requis." });
    return;
  }
  const payment = await createPayment(response.locals.user.organizationId, {
    amountCents: Number(amountCents),
    method: method.trim(),
    reference: String(reference).trim(),
    paidAt,
    notes: String(notes).trim(),
  });
  response.status(201).json({ payment });
});

app.post("/api/payments/:id/refund", requireUser, async (request, response) => {
  if (!canManageUsers(response.locals.user.role)) {
    response.status(403).json({ error: "Permission insuffisante pour rembourser un paiement." });
    return;
  }
  if (!(await refundPayment(response.locals.user.organizationId, param(request.params.id)))) {
    response.status(404).json({ error: "Paiement introuvable." });
    return;
  }
  response.status(204).send();
});

// Contrats
app.get("/api/contracts", requireUser, async (_request, response) => {
  response.json({ contracts: await listContracts(response.locals.user.organizationId) });
});

app.post("/api/contracts", requireUser, async (request, response) => {
  const { title, contractNumber = "", content = "", startDate, endDate, status = "draft" } = request.body ?? {};
  if (typeof title !== "string" || !title.trim()) {
    response.status(400).json({ error: "Le titre du contrat est obligatoire." });
    return;
  }
  const contract = await createContract(response.locals.user.organizationId, {
    title: title.trim(),
    contractNumber: String(contractNumber).trim(),
    content: String(content).trim(),
    startDate: startDate ? String(startDate) : undefined,
    endDate: endDate ? String(endDate) : undefined,
    status: String(status).trim(),
  });
  response.status(201).json({ contract });
});

app.patch("/api/contracts/:id/status", requireUser, async (request, response) => {
  const status = String(request.body?.status ?? "");
  if (!["draft", "sent", "signed", "expired", "cancelled"].includes(status)) {
    response.status(400).json({ error: "Statut de contrat invalide." });
    return;
  }
  const contract = await updateContractStatus(response.locals.user.organizationId, param(request.params.id), status);
  if (!contract) {
    response.status(404).json({ error: "Contrat introuvable." });
    return;
  }
  response.json({ contract });
});

// Notifications
app.get("/api/notifications", requireUser, async (_request, response) => {
  response.json({ notifications: await listNotifications(response.locals.user.organizationId, response.locals.user.id) });
});

app.post("/api/notifications/:id/read", requireUser, async (request, response) => {
  if (!(await markNotificationRead(response.locals.user.organizationId, response.locals.user.id, param(request.params.id)))) {
    response.status(404).json({ error: "Notification introuvable." });
    return;
  }
  response.status(204).send();
});

// Paramètres
app.get("/api/settings", requireUser, async (_request, response) => {
  response.json(await getSettings(response.locals.user.organizationId));
});

app.put("/api/settings", requireUser, async (request, response) => {
  if (!canManageUsers(response.locals.user.role)) {
    response.status(403).json({ error: "Permission insuffisante." });
    return;
  }
  response.json(await updateSettings(response.locals.user.organizationId, request.body ?? {}));
});

// Rapports
app.get("/api/reports/summary", requireUser, async (_request, response) => {
  response.json({ summary: await reportSummary(response.locals.user.organizationId) });
});

// Employés
app.get("/api/employees", requireUser, async (_request, response) => {
  response.json({ employees: await listEmployees(response.locals.user.organizationId) });
});

app.post("/api/employees", requireUser, async (request, response) => {
  if (!canManageUsers(response.locals.user.role)) {
    response.status(403).json({ error: "Permission insuffisante." });
    return;
  }
  const { name, email, role, phone = "" } = request.body ?? {};
  if (typeof name !== "string" || typeof email !== "string" || !isRole(String(role))) {
    response.status(400).json({ error: "Nom, email et rôle valides requis." });
    return;
  }
  response.status(201).json({
    employee: await createEmployee(response.locals.user.organizationId, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: String(phone).trim(),
      role,
    }),
  });
});

app.delete("/api/employees/:id", requireUser, async (request, response) => {
  if (!canManageUsers(response.locals.user.role)) {
    response.status(403).json({ error: "Permission insuffisante." });
    return;
  }
  if (!(await deactivateEmployee(response.locals.user.organizationId, param(request.params.id)))) {
    response.status(404).json({ error: "Employé introuvable." });
    return;
  }
  response.status(204).send();
});

// Global Error Handler
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ error: "Erreur interne du serveur." });
});

async function start() {
  await initializeDatabase();
  await ensureAdmin();
  app.listen(port, () => console.log(`VENORIA backend listening on http://localhost:${port}`));
}

start().catch(async (error) => {
  console.error("Unable to start VENORIA backend", error);
  await pool.end();
  process.exit(1);
});

