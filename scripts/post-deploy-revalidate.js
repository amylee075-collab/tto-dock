/**
 * 배포 완료 후 전체 캐시 초기화 — Revalidate API 자동 호출.
 * 사용: PRODUCTION_URL, REVALIDATE_SECRET 을 .env.local 또는 환경 변수에 설정 후
 *      npm run deploy:vercel (또는 node scripts/post-deploy-revalidate.js)
 */
const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || !trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const PRODUCTION_URL = process.env.PRODUCTION_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "";
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "";

async function main() {
  const base = PRODUCTION_URL.replace(/\/$/, "");
  if (!base) {
    console.warn("[post-deploy-revalidate] PRODUCTION_URL 또는 VERCEL_PROJECT_PRODUCTION_URL 이 없어 재검증 API를 호출하지 않습니다.");
    console.warn("  .env.local 에 PRODUCTION_URL=https://your-app.vercel.app 를 넣고 REVALIDATE_SECRET 을 설정한 뒤 다시 실행하세요.");
    process.exit(0);
    return;
  }
  const url = `${base}/api/revalidate`;
  const headers = { "Content-Type": "application/json" };
  if (REVALIDATE_SECRET) headers["Authorization"] = `Bearer ${REVALIDATE_SECRET}`;

  try {
    const res = await fetch(url, { method: "POST", headers, body: "{}" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log("[post-deploy-revalidate] 전체 캐시 재검증 완료:", data.revalidated || data);
    } else {
      console.warn("[post-deploy-revalidate] 실패:", res.status, data);
      process.exit(1);
    }
  } catch (err) {
    console.warn("[post-deploy-revalidate] 요청 실패:", err.message);
    process.exit(1);
  }
}

main();
