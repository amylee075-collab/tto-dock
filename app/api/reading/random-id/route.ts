import { NextRequest } from "next/server";
import { getRandomStoryIdFromSupabase } from "@/lib/content-from-supabase";

export const dynamic = "force-dynamic";

const SECTION_MAP: Record<string, "과학" | "역사" | "사회"> = {
  science: "과학",
  history: "역사",
  society: "사회",
};

/** GET /api/reading/random-id?type=category|digital&section=science|history|society (category일 때만) */
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  if (!type || !["category", "digital"].includes(type)) {
    return Response.json({ error: "type=category|digital required" }, { status: 400 });
  }

  let section: "과학" | "역사" | "사회" | undefined;
  if (type === "category") {
    const s = request.nextUrl.searchParams.get("section");
    if (s && (s === "science" || s === "history" || s === "society")) {
      section = SECTION_MAP[s];
    }
  }

  const id = await getRandomStoryIdFromSupabase(
    type as "category" | "digital",
    section
  );
  if (!id) {
    return Response.json({ id: null, message: "no contents" }, { status: 200 });
  }
  return Response.json({ id });
}
