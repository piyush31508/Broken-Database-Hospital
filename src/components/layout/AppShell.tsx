"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { CaseBrief, HospitalStatus, PlayerStats } from "@/lib/types";
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

  const defaultCaseId =
    initialCaseId ??
    cases.find((c) => c.status === "active")?.id ??
    cases[0]?.id ??
    "";

  const [selectedCaseId, setSelectedCaseId] = useState(defaultCaseId);

  const selectedCase = useMemo(
    () => cases.find((c) => c.id === selectedCaseId) ?? cases[0],
    [cases, selectedCaseId],
  );

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    setMobileOpen(false);
  };

  const sidebar = (
    <Sidebar
      cases={cases}
      selectedCaseId={selectedCase?.id ?? ""}
      onSelectCase={handleSelectCase}
    />
  );

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
            radial-gradient(ellipse 80% 50% at 10% -10%, rgba(244,63,94,0.12), transparent 55%),
            radial-gradient(ellipse 60% 40% at 90% 0%, rgba(45,212,191,0.1), transparent 50%),
            radial-gradient(ellipse 50% 30% at 50% 100%, rgba(56,189,248,0.06), transparent 55%)
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

      <Box sx={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
        <Header
          hospital={hospital}
          player={player}
          onMenuClick={() => setMobileOpen(true)}
        />
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flex: 1,
          minHeight: 0,
        }}
      >
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
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
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

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            bgcolor: "transparent",
          }}
        >
          {selectedCase ? (
            <CasePanel caseItem={selectedCase} />
          ) : (
            <Box sx={{ p: 4, color: "text.secondary" }}>
              No cases in the queue.
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
