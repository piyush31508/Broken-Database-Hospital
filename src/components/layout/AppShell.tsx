"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type {
  CaseBrief,
  HospitalStatus,
  PlayerStats,
} from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CasePanel } from "@/components/cases/CasePanel";

const SIDEBAR_WIDTH = 300;

type AppShellProps = {
  cases: CaseBrief[];
  hospital: HospitalStatus;
  player: PlayerStats;
  initialCaseId?: string;
};

export function AppShell({
  cases,
  hospital,
  player,
  initialCaseId,
}: AppShellProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [mobileOpen, setMobileOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Mutable game state
  // ---------------------------------------------------------------------------

  const [gameCases, setGameCases] = useState<CaseBrief[]>(cases);
  const [gamePlayer, setGamePlayer] =
    useState<PlayerStats>(player);

  const defaultCaseId =
    initialCaseId ??
    gameCases.find((c) => c.status === "active")?.id ??
    gameCases[0]?.id ??
    "";

  const [selectedCaseId, setSelectedCaseId] =
    useState(defaultCaseId);

  const selectedCase = useMemo(
    () =>
      gameCases.find((c) => c.id === selectedCaseId) ??
      gameCases[0],
    [gameCases, selectedCaseId],
  );

  // ---------------------------------------------------------------------------
  // Case selection
  // ---------------------------------------------------------------------------

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    setMobileOpen(false);
  };

  // ---------------------------------------------------------------------------
  // Case completion
  // ---------------------------------------------------------------------------

  const handleCaseSolved = (caseId: string) => {
    const solvedCase = gameCases.find(
      (caseItem) => caseItem.id === caseId,
    );
  
    if (!solvedCase || solvedCase.status === "resolved") {
      return;
    }
  
    setGameCases((currentCases) => {
      const solvedIndex = currentCases.findIndex(
        (caseItem) => caseItem.id === caseId,
      );
  
      return currentCases.map((caseItem, index) => {
        // Mark the current case as resolved
        if (caseItem.id === caseId) {
          return {
            ...caseItem,
            status: "resolved" as const,
          };
        }
  
        // Unlock the next case
        if (
          index === solvedIndex + 1 &&
          caseItem.status === "locked"
        ) {
          return {
            ...caseItem,
            status: "diagnosing" as const,
          };
        }
  
        return caseItem;
      });
    });
  
    // Award XP and update player stats
    setGamePlayer((currentPlayer) => ({
      ...currentPlayer,
      xp: currentPlayer.xp + solvedCase.xpReward,
      casesSolved: currentPlayer.casesSolved + 1,
      streak: currentPlayer.streak + 1,
    }));
  };

  // ---------------------------------------------------------------------------
  // Sidebar
  // ---------------------------------------------------------------------------

  const sidebar = (
    <Sidebar
      cases={gameCases}
      selectedCaseId={selectedCase?.id ?? ""}
      onSelectCase={handleSelectCase}
    />
  );

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      {/* Atmosphere layers */}
      <Box
        aria-hidden
        sx={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(
              ellipse 80% 50% at 10% -10%,
              rgba(244,63,94,0.12),
              transparent 55%
            ),
            radial-gradient(
              ellipse 60% 40% at 90% 0%,
              rgba(45,212,191,0.1),
              transparent 50%
            ),
            radial-gradient(
              ellipse 50% 30% at 50% 100%,
              rgba(56,189,248,0.06),
              transparent 55%
            )
          `,
        }}
      />

      <Box
        aria-hidden
        className="hospital-grid"
        sx={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          zIndex: 0,
          opacity: 0.35,
        }}
      />

      {/* Header */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <Header
          hospital={hospital}
          player={gamePlayer}
          onMenuClick={() => setMobileOpen(true)}
        />
      </Box>

      {/* Main content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Desktop sidebar */}
        {isDesktop ? (
          <Box
            component="nav"
            sx={{
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            {sidebar}
          </Box>
        ) : (
          /* Mobile sidebar */
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              "& .MuiDrawer-paper": {
                width: SIDEBAR_WIDTH,
                boxSizing: "border-box",
              },
            }}
          >
            {sidebar}
          </Drawer>
        )}

        {/* Case content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            bgcolor: "transparent",
          }}
        >
          {selectedCase ? (
            <CasePanel
              caseItem={selectedCase}
              playerId={gamePlayer.id}
              onCaseSolved={handleCaseSolved}
            />
          ) : (
            <Box
              sx={{
                p: 4,
                color: "text.secondary",
              }}
            >
              No cases in the queue.
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}