import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const cookieStore = (await cookies()) as {
    get(name: string): { value: string } | undefined;
    set?: (args: {
      name: string;
      value: string;
      path?: string;
      maxAge?: number;
      domain?: string;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: boolean | "lax" | "strict" | "none";
    }) => void;
  };

  const normalizeCookieOptions = (options: Record<string, unknown>) => ({
    ...options,
    sameSite:
      options.sameSite === true
        ? "lax"
        : options.sameSite === false
          ? undefined
          : options.sameSite,
  });

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set?.(
          normalizeCookieOptions({ name, value, ...options }) as any,
        );
      },
      remove(name, options) {
        cookieStore.set?.(
          normalizeCookieOptions({
            name,
            value: "",
            ...options,
            maxAge: 0,
          }) as any,
        );
      },
    },
  });
}
