import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MOCK_CASES } from "@/lib/data/mock-cases";
import { MOCK_HOSPITAL } from "@/lib/data/mock-hospital";
import { createPlayerFromUser } from "@/lib/data/player";
import { tryCreateAuthServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await tryCreateAuthServerClient();

  if (!supabase) {
    redirect("/login?error=configuration");
  }

  const { data, error } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    console.error("Unable to verify Supabase session:", error);
  }

  if (!data.user) {
    redirect("/login");
  }

  return (
    <AppShell
      cases={MOCK_CASES}
      hospital={MOCK_HOSPITAL}
      player={createPlayerFromUser(data.user)}
      userEmail={data.user.email ?? ""}
    />
  );
}
