import { NextResponse } from "next/server";
import {
  getCategoryContentsFromSupabase,
  type CategoryContentFilter,
  type CategoryContentSort,
} from "@/lib/content-from-supabase";

const FILTERS: CategoryContentFilter[] = ["전체", "과학", "역사", "사회", "예술", "기술·AI"];
const SORTS: CategoryContentSort[] = ["title", "difficulty"];

function parseFilter(value: string | null): CategoryContentFilter {
  if (value && FILTERS.includes(value as CategoryContentFilter)) {
    return value as CategoryContentFilter;
  }
  return "전체";
}

function parseSort(value: string | null): CategoryContentSort {
  if (value && SORTS.includes(value as CategoryContentSort)) {
    return value as CategoryContentSort;
  }
  return "title";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = parseFilter(searchParams.get("filter"));
  const sortBy = parseSort(searchParams.get("sortBy"));

  const stories = await getCategoryContentsFromSupabase({ filter, sortBy });

  return NextResponse.json({
    stories,
    filter,
    sortBy,
  });
}
