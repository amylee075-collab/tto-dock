/**
 * 실제 DB 데이터 샘플링 (badges JSON 배열, type 소문자 검증)
 * 사용: .env에서 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 필요
 * 실행: node scripts/check-supabase-contents.js
 * 또는: npx dotenv -e .env.local -- node scripts/check-supabase-contents.js
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.");
  process.exit(1);
}

const API = `${url}/rest/v1/contents?select=id,title,type,section,badges&order=updated_at.desc&limit=5`;

fetch(API, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
})
  .then((r) => r.json())
  .then((data) => {
    if (Array.isArray(data)) {
      console.log("=== contents 5건 샘플 (id, title, type, section, badges) ===\n");
      data.forEach((row, i) => {
        console.log(`[${i + 1}]`, {
          id: row.id,
          title: row.title?.slice?.(0, 30),
          type: row.type,
          section: row.section,
          badges: row.badges,
          badgesIsArray: Array.isArray(row.badges),
        });
      });
      const types = [...new Set(data.map((r) => r.type))];
      console.log("\n=== 검증 ===");
      console.log("type 값들(소문자 여부):", types);
      console.log(".eq('type','long') 필터 유효:", types.includes("long"));
      console.log("badges 배열 형태:", data.every((r) => r.badges == null || Array.isArray(r.badges)) ? "OK" : "일부 비배열");
    } else {
      console.error("응답이 배열이 아님:", data);
    }
  })
  .catch((e) => {
    console.error("요청 실패:", e.message);
    process.exit(1);
  });
