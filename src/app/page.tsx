import { AppShell } from "@/components/layout/AppShell";
import { MOCK_CASES } from "@/lib/data/mock-cases";
import { MOCK_HOSPITAL, MOCK_PLAYER } from "@/lib/data/mock-player";

export default function HomePage() {
  return (
    <AppShell
      cases={MOCK_CASES}
      hospital={MOCK_HOSPITAL}
      player={MOCK_PLAYER}
    />
  );
}
