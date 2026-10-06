import type { User } from "@supabase/supabase-js";
import type { PlayerStats } from "@/lib/types";

export function createPlayerFromUser(
  user: Pick<User, "id" | "email">,
): PlayerStats {
  const emailName = user.email?.split("@")[0]?.trim();

  return {
    id: user.id,
    displayName: emailName || "Doctor",
    xp: 0,
    xpToNextRank: 1000,
    rank: "Intern",
    casesSolved: 0,
    streak: 0,
  };
}
