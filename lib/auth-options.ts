import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseAnon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
const supabaseService = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.trim().toLowerCase();
        const supabase = createClient(supabaseUrl, supabaseAnon);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: credentials.password,
        });
        if (error || !data.user) return null;
        return {
          id: data.user.id,
          email: data.user.email ?? email,
          name: data.user.user_metadata?.name ?? data.user.email ?? email,
          image: data.user.user_metadata?.avatar_url ?? undefined,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        (token as { id?: string; provider?: string }).id = user.id;
        (token as { id?: string; provider?: string }).provider = account?.provider ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as { id?: string; provider?: string };
      if (session.user) {
        (session.user as { id?: string }).id = t.id as string;
        (session as { provider?: string }).provider = t.provider as string;
      }
      if (t.id && supabaseService) {
        try {
          const supabase = createClient(supabaseUrl, supabaseService);
          const { data } = await supabase
            .from("user_profiles")
            .select("terms_agreed_at")
            .eq("auth_user_id", t.id)
            .single();
          (session as { needsTermsAgreement?: boolean }).needsTermsAgreement = !data?.terms_agreed_at;
        } catch {
          (session as { needsTermsAgreement?: boolean }).needsTermsAgreement = true;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: { strategy: "jwt" as const, maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};

