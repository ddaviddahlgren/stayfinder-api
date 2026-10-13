const API = "http://localhost:3000";

async function login(email: string, password: string) {
  await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}: ${res.status}`);

  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}

async function call(method: string, path: string, cookie: string | null, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json };
}

let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`, ok ? "" : JSON.stringify(detail));
}

async function main() {
  const A = await login("a@example.com", "secret123"); // guest
  const B = await login("b@example.com", "secret123"); // owner

  const prop = await call("POST", "/properties", B, {
    title: "Smoke test cabin",
    description: "Temporary",
    location: "Testville",
    price_per_night: 100,
    max_guests: 2,
  });
  check("B creates property (201)", prop.status === 201, prop);
  const base = `/properties/${prop.json.id}/bookings`;

  const guest = { guest_name: "Anna Karlsson", guest_email: "anna@example.com", guests: 2 };

  const b1 = await call("POST", base, A, { ...guest, check_in: "2027-12-01", check_out: "2027-12-04" });
  check("valid booking: 201, pending, price 300", b1.status === 201 && b1.json?.status === "pending" && b1.json?.total_price === 300, b1);

  const dup = await call("POST", base, A, { ...guest, check_in: "2027-12-01", check_out: "2027-12-04" });
  check("same dates: 409", dup.status === 409, dup);

  const turnover = await call("POST", base, A, { ...guest, check_in: "2027-12-04", check_out: "2027-12-06" });
  check("same-day turnover: 201", turnover.status === 201, turnover);

  const tooMany = await call("POST", base, A, { ...guest, guests: 3, check_in: "2027-12-10", check_out: "2027-12-12" });
  check("too many guests: 400", tooMany.status === 400, tooMany);

  const sneaky = await call("POST", base, A, {
    ...guest, check_in: "2027-12-20", check_out: "2027-12-22", total_price: 1, status: "confirmed",
  });
  check("client price/status ignored", sneaky.status === 201 && sneaky.json?.total_price === 200 && sneaky.json?.status === "pending", sneaky);

  const zero = await call("POST", base, A, { ...guest, guests: 0, check_in: "2027-12-25", check_out: "2027-12-26" });
  check("guests 0: 400", zero.status === 400, zero);

  const reversed = await call("POST", base, A, { ...guest, check_in: "2027-12-28", check_out: "2027-12-27" });
  check("check-out before check-in: 400", reversed.status === 400, reversed);

  const noAuth = await call("POST", base, null, { ...guest, check_in: "2027-12-30", check_out: "2027-12-31" });
  check("no login: 401", noAuth.status === 401, noAuth);

  const listB = await call("GET", base, B);
  check("owner sees all 3 bookings", listB.status === 200 && listB.json?.length === 3, listB);

  const delByOwner = await call("DELETE", `${base}/${b1.json.id}`, B);
  check("owner deleting guest's booking: 404", delByOwner.status === 404, delByOwner);

  const delByGuest = await call("DELETE", `${base}/${b1.json.id}`, A);
  check("guest deleting own booking: 200", delByGuest.status === 200, delByGuest);

  // Cleanup: deleting the property cascades to its bookings
  await call("DELETE", `/properties/${prop.json.id}`, B);

  console.log(failed === 0 ? "\nAll passed" : `\n${failed} failed`);
}

main().catch((e) => { console.error(e); process.exit(1); });