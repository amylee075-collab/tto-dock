/**
 * Supabase contents 테이블 스키마 타입
 * - 자동 생성: supabase gen types typescript --linked > types/supabase.ts (원격 연결 시)
 * - 로컬 Docker: supabase gen types typescript --local > types/supabase.ts
 * 아래는 lib/content-from-supabase.ts의 ContentRow와 동기화된 수동 정의입니다.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ContentsRow {
  id: string;
  title: string;
  thumbnail_url: string | null;
  content: string | null;
  type: "short" | "long" | "digital" | "category";
  vocabulary?: Array<{ word: string; meaning: string; example: string }> | null;
  section?: string | null;
  /** JSON 배열 예: ["비문학","역사","★☆☆"] */
  badges?: string[] | Json | null;
  /** DB에 컬럼이 없을 수 있음. 있으면 1|2|3 또는 '쉬움'|'보통'|'어려움' */
  difficulty?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Database {
  public: {
    Tables: {
      contents: {
        Row: ContentsRow;
        Insert: Omit<ContentsRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ContentsRow>;
      };
    };
  };
}
