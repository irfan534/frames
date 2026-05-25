import { NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

const connectionMessage =
  "Unable to connect to Supabase. Check your project URL and restart the app.";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Configure Supabase env vars before logging in." },
      { status: 503 }
    );
  }

  const payload = await request.json().catch(() => null);
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Enter your email and password." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient({ fetch: safeSupabaseFetch });
  if (!supabase) {
    return NextResponse.json({ error: connectionMessage }, { status: 503 });
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const connectionFailed = error.message === connectionMessage;
    return NextResponse.json(
      { error: error.message },
      { status: connectionFailed ? 503 : 401 }
    );
  }

  return NextResponse.json({ ok: true });
}

const safeSupabaseFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch {
    return NextResponse.json({ message: connectionMessage }, { status: 400 });
  }
};
