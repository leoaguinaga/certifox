/**
 * Prueba de carga (k6) — gate antes de cada salto de clientes (O3).
 *
 *   k6 run -e BASE_URL=https://staging.certifox.pe -e CERT_CODE=CFX-XXXX-XXXX-XXXX-XXXX loadtest/smoke.js
 *
 * Escenarios:
 *  - catálogo público (cacheado): alto volumen
 *  - verificación de certificados: tráfico realista repartido en muchas IPs
 *    (en staging desactiva la regla WAF o el rate limit bloqueará a k6, que es lo esperado)
 *  - login + campus: usuarios autenticados navegando
 * Umbrales: p95 < 500 ms en lecturas públicas, < 1 s en campus, < 1% de errores.
 */
import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE_URL || "http://localhost:3000";
const CERT = __ENV.CERT_CODE || "CFX-2025-9831";
const EMAIL = __ENV.USER_EMAIL || "alumno@certifox.pe";
const PASSWORD = __ENV.USER_PASSWORD || "Password123!";

export const options = {
  scenarios: {
    catalog: { executor: "constant-arrival-rate", rate: 50, timeUnit: "1s", duration: "2m", preAllocatedVUs: 50, exec: "catalog" },
    verify: { executor: "constant-arrival-rate", rate: 20, timeUnit: "1s", duration: "2m", preAllocatedVUs: 30, exec: "verify" },
    campus: { executor: "ramping-vus", startVUs: 0, stages: [{ duration: "30s", target: 30 }, { duration: "1m", target: 30 }, { duration: "30s", target: 0 }], exec: "campus" },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    "http_req_duration{scenario:catalog}": ["p(95)<500"],
    "http_req_duration{scenario:verify}": ["p(95)<500"],
    "http_req_duration{scenario:campus}": ["p(95)<1000"],
  },
};

export function catalog() {
  const res = http.get(`${BASE}/cursos`);
  check(res, { "catálogo 200": (r) => r.status === 200 });
}

export function verify() {
  const res = http.get(`${BASE}/verificar/${CERT}`, {
    headers: { "x-forwarded-for": `10.${__VU % 255}.${__ITER % 255}.1` },
  });
  check(res, { "verificación 200": (r) => r.status === 200 });
}

export function campus() {
  const jar = http.cookieJar();
  const login = http.post(`${BASE}/api/auth/sign-in/email`, JSON.stringify({ email: EMAIL, password: PASSWORD }), {
    headers: { "Content-Type": "application/json", Origin: BASE },
  });
  check(login, { "login 200": (r) => r.status === 200 });
  for (const path of ["/campus", "/campus/cursos", "/campus/certificados"]) {
    const res = http.get(`${BASE}${path}`, { jar });
    check(res, { [`${path} 200`]: (r) => r.status === 200 });
    sleep(1);
  }
}
