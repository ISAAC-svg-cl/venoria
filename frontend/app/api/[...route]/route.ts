import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "venoria-secret-key-2026");

// In-memory data store for serverless demo & live preview
// Clean store without demonstration data
const store = {
  halls: [] as Array<{ id: number; name: string; capacity: number; city: string; address: string; price_cents: number; status: string; image?: string }>,
  clients: [] as Array<{ id: number; name: string; email: string; phone: string; company: string; client_type: string; status: string }>,
  services: [] as Array<{ id: number; name: string; category: string; provider: string; price_cents: number; status: string }>,
  reservations: [] as Array<{ id: number; title: string; event_type: string; starts_at: string; ends_at: string; guest_count: number; total_cents: number; status: string }>,
  payments: [] as Array<{ id: number; reference: string; amount_cents: number; method: string; paid_at: string; status: string }>,
  contracts: [] as Array<{ id: number; title: string; contract_number: string; status: string; created_at: string }>,
  employees: [
    { id: "e1-uuid", name: "Administrateur", email: "admin@venoria.fr", phone: "", role: "Administrateur", status: "active" },
  ],
  notifications: [] as Array<{ id: number; title: string; detail: string; read_at: string | null }>,
  settings: {
    name: "VENORIA",
    currency: "USD",
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
    return NextResponse.json({
      user: {
        id: (user.id as string) || (user.sub as string) || "usr-admin-venoria",
        email: (user.email as string) || "admin@venoria.fr",
        name: "Administrateur",
        role: "Administrateur",
      },
    });
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
      name: "Administrateur",
      role: "Administrateur",
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
      image: body.image || body.imageUrl || "",
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
