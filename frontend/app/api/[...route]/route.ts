import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "venoria-secret-key-2026");

// In-memory data store for serverless demo & live preview
const store = {
  halls: [
    { id: 1, name: "Le Jardin d’Opale", capacity: 250, city: "Chantilly", address: "12 route des Châteaux", price_cents: 350000, status: "active" },
    { id: 2, name: "Le Grand Salon Vénitien", capacity: 180, city: "Paris", address: "8 place Vendôme", price_cents: 480000, status: "active" },
  ],
  clients: [
    { id: 1, name: "Sophie & Marc Martin", email: "sophie.martin@email.com", phone: "06 12 34 56 78", company: "Particulier", client_type: "Particulier", status: "active" },
    { id: 2, name: "Maison Laurent & Co", email: "contact@laurent-events.fr", phone: "01 45 67 89 00", company: "Agence Laurent", client_type: "Entreprise", status: "active" },
  ],
  services: [
    { id: 1, name: "Décoration Florale Prestige", category: "Décoration", provider: "Atelier Végétal", price_cents: 120000, status: "active" },
    { id: 2, name: "Service Traiteur Gastronomique", category: "Restauration", provider: "Chef Étoilé Réception", price_cents: 850000, status: "active" },
  ],
  reservations: [
    { id: 1, title: "Mariage Sophie & Marc", event_type: "Mariage", starts_at: new Date(Date.now() + 86400000 * 5).toISOString(), ends_at: new Date(Date.now() + 86400000 * 5 + 3600000 * 12).toISOString(), guest_count: 140, total_cents: 650000, status: "confirmed" },
  ],
  payments: [
    { id: 1, reference: "Acompte Réservation #001", amount_cents: 250000, method: "Virement bancaire", paid_at: new Date().toISOString(), status: "confirmed" },
  ],
  contracts: [
    { id: 1, title: "Contrat de Mise à Disposition - Mariage Martin", contract_number: "CTR-2026-001", status: "signed", created_at: new Date().toISOString() },
  ],
  employees: [
    { id: "e1-uuid", name: "Clara Renard", email: "clara.renard@venoria.fr", phone: "06 98 76 54 32", role: "ADMIN", status: "active" },
    { id: "e2-uuid", name: "Léa Bernard", email: "lea.bernard@venoria.fr", phone: "06 11 22 33 44", role: "MANAGER", status: "active" },
  ],
  notifications: [
    { id: 1, title: "Bienvenue sur Venoria", detail: "Votre espace de gestion événementielle est opérationnel.", read_at: null },
  ],
  settings: {
    name: "VENORIA Prestige & Domaines",
    currency: "EUR",
  },
};

async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get("venoria_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const path = route.join("/");

  if (path === "health") {
    return NextResponse.json({ status: "ok", service: "venoria-serverless" });
  }

  if (path === "auth/me") {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ user });
  }

  if (path === "reports/summary") {
    const revenue = store.payments.filter((p) => p.status === "confirmed").reduce((acc, p) => acc + p.amount_cents, 0);
    return NextResponse.json({
      summary: {
        revenue_cents: String(revenue),
        reservations: String(store.reservations.length),
        clients: String(store.clients.length),
        payments: String(store.payments.length),
        halls: String(store.halls.length),
      },
    });
  }

  if (path === "halls") return NextResponse.json({ halls: store.halls });
  if (path === "clients") return NextResponse.json({ clients: store.clients });
  if (path === "services") return NextResponse.json({ services: store.services });
  if (path === "reservations") return NextResponse.json({ reservations: store.reservations });
  if (path === "payments") return NextResponse.json({ payments: store.payments });
  if (path === "contracts") return NextResponse.json({ contracts: store.contracts });
  if (path === "employees") return NextResponse.json({ employees: store.employees });
  if (path === "notifications") return NextResponse.json({ notifications: store.notifications });
  if (path === "settings") return NextResponse.json({ data: store.settings });

  return NextResponse.json({ records: [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const path = route.join("/");

  if (path === "auth/login") {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    // Accept admin credentials or any valid email with password >= 6 chars
    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: "Email ou mot de passe invalide." }, { status: 400 });
    }

    const user = {
      id: "usr-admin-venoria",
      organizationId: "org-venoria-001",
      email,
      name: email.startsWith("admin") ? "Clara Renard" : email.split("@")[0],
      role: "OWNER",
    };

    const token = await new SignJWT(user)
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const res = NextResponse.json({ user });
    res.cookies.set("venoria_session", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800,
    });
    return res;
  }

  if (path === "auth/logout") {
    const res = new NextResponse(null, { status: 204 });
    res.cookies.set("venoria_session", "", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 0,
    });
    return res;
  }

  const body = await req.json().catch(() => ({}));

  if (path === "halls") {
    const newHall = {
      id: Date.now(),
      name: body.name,
      capacity: Number(body.capacity || 100),
      city: body.city || "Paris",
      address: body.address || "",
      price_cents: Number(body.priceCents || 0),
      status: "active",
    };
    store.halls.unshift(newHall);
    return NextResponse.json({ hall: newHall }, { status: 201 });
  }

  if (path === "clients") {
    const newClient = {
      id: Date.now(),
      name: body.name,
      email: body.email || "",
      phone: body.phone || "",
      company: body.company || "Particulier",
      client_type: body.clientType || "Particulier",
      status: "active",
    };
    store.clients.unshift(newClient);
    return NextResponse.json({ client: newClient }, { status: 201 });
  }

  if (path === "services") {
    const newService = {
      id: Date.now(),
      name: body.name,
      category: body.category || "Général",
      provider: body.provider || "Interne",
      price_cents: Number(body.priceCents || 0),
      status: "active",
    };
    store.services.unshift(newService);
    return NextResponse.json({ service: newService }, { status: 201 });
  }

  if (path === "reservations") {
    const newRes = {
      id: Date.now(),
      title: body.title,
      event_type: body.eventType || "Autre",
      starts_at: body.startsAt || new Date().toISOString(),
      ends_at: body.endsAt || new Date().toISOString(),
      guest_count: Number(body.guestCount || 50),
      total_cents: Number(body.totalCents || 0),
      status: "confirmed",
    };
    store.reservations.unshift(newRes);
    return NextResponse.json({ reservation: newRes }, { status: 201 });
  }

  if (path === "payments") {
    const newPay = {
      id: Date.now(),
      reference: body.reference || "Paiement",
      amount_cents: Number(body.amountCents || 0),
      method: body.method || "Virement",
      paid_at: body.paidAt || new Date().toISOString(),
      status: "confirmed",
    };
    store.payments.unshift(newPay);
    return NextResponse.json({ payment: newPay }, { status: 201 });
  }

  if (path === "contracts") {
    const newCtr = {
      id: Date.now(),
      title: body.title,
      contract_number: body.contractNumber || `CTR-${Date.now().toString().slice(-4)}`,
      status: body.status || "draft",
      created_at: new Date().toISOString(),
    };
    store.contracts.unshift(newCtr);
    return NextResponse.json({ contract: newCtr }, { status: 201 });
  }

  if (path === "employees") {
    const newEmp = {
      id: `emp-${Date.now()}`,
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      role: body.role || "EMPLOYEE",
      status: "active",
    };
    store.employees.unshift(newEmp);
    return NextResponse.json({ employee: newEmp }, { status: 201 });
  }

  if (path.startsWith("notifications/") && path.endsWith("/read")) {
    const notifId = Number(route[1]);
    store.notifications = store.notifications.filter((n) => n.id !== notifId);
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const resource = route[0];
  const id = route[1];

  if (resource === "halls") store.halls = store.halls.filter((item) => String(item.id) !== id);
  if (resource === "clients") store.clients = store.clients.filter((item) => String(item.id) !== id);
  if (resource === "services") store.services = store.services.filter((item) => String(item.id) !== id);
  if (resource === "reservations") store.reservations = store.reservations.filter((item) => String(item.id) !== id);
  if (resource === "payments") store.payments = store.payments.filter((item) => String(item.id) !== id);
  if (resource === "contracts") store.contracts = store.contracts.filter((item) => String(item.id) !== id);
  if (resource === "employees") store.employees = store.employees.filter((item) => String(item.id) !== id);

  return new NextResponse(null, { status: 204 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const path = route.join("/");

  if (path === "settings") {
    const body = await req.json().catch(() => ({}));
    store.settings = { ...store.settings, ...body };
    return NextResponse.json({ data: store.settings });
  }

  return NextResponse.json({ success: true });
}
