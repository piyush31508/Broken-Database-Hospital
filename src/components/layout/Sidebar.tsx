"use client";

import {
  Box,
  List,
  ListItemButton,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import type { CaseBrief } from "@/lib/types";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { CaseStatusBadge } from "@/components/ui/CaseStatusBadge";

type CaseListItemProps = {
  caseItem: CaseBrief;
  selected: boolean;
  onSelect: (id: string) => void;
};

function CaseListItem({ caseItem, selected, onSelect }: CaseListItemProps) {
  const locked = caseItem.status === "locked";
  const resolved = caseItem.status === "resolved";

  return (
    <ListItemButton
      selected={selected}
      disabled={locked}
      onClick={() => onSelect(caseItem.id)}
      sx={{
        alignItems: "flex-start",
        gap: 1,
        px: 1.5,
        py: 1.25,
        mx: 1,
        mb: 0.75,
        borderRadius: 2,
        border: "1px solid",
        borderColor: selected ? "primary.dark" : "transparent",
        bgcolor: selected ? "rgba(45,212,191,0.08)" : "transparent",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
        "&.Mui-selected:hover": {
          bgcolor: "rgba(45,212,191,0.12)",
        },
        "&:hover": {
          bgcolor: locked ? "transparent" : "hospital.elevated",
        },
        "&.Mui-disabled": {
          opacity: 0.55,
        },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          sx={{ mb: 0.75, alignItems: "center" }}
        >
          <SeverityBadge severity={caseItem.severity} />
          <CaseStatusBadge status={caseItem.status} />
        </Stack>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.875rem",
            color: resolved ? "text.secondary" : "text.primary",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {caseItem.title}
        </Typography>
        <Typography sx={{ fontSize: "0.72rem", color: "text.disabled" }}>
          {caseItem.department}
        </Typography>
        <Stack
          direction="row"
          spacing={1.25}
          useFlexGap
          sx={{ mt: 0.75, alignItems: "center" }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "warning.main",
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "0.68rem",
            }}
          >
            +{caseItem.xpReward} XP
          </Typography>
          <Stack
            direction="row"
            spacing={0.4}
            useFlexGap
            sx={{ alignItems: "center" }}
          >
            <AccessTimeOutlinedIcon
              sx={{ fontSize: 12, color: "text.disabled" }}
            />
            <Typography
              variant="caption"
              sx={{ color: "text.disabled", fontSize: "0.68rem" }}
            >
              {caseItem.estimatedMinutes}m
            </Typography>
          </Stack>
        </Stack>
      </Box>
      {locked && (
        <LockOutlinedIcon
          sx={{ fontSize: 16, color: "text.disabled", mt: 0.5 }}
        />
      )}
      {resolved && (
        <CheckCircleOutlinedIcon
          sx={{ fontSize: 16, color: "success.main", mt: 0.5 }}
        />
      )}
    </ListItemButton>
  );
}

type SidebarProps = {
  cases: CaseBrief[];
  selectedCaseId: string;
  onSelectCase: (id: string) => void;
};

export function Sidebar({
  cases,
  selectedCaseId,
  onSelectCase,
}: SidebarProps) {
  const openCases = cases.filter((c) => c.status !== "resolved");
  const resolvedCases = cases.filter((c) => c.status === "resolved");

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", display: "block", lineHeight: 1.2 }}
        >
          Case Queue
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.disabled", mt: 0.5, fontSize: "0.75rem" }}
        >
          {openCases.length} open · {resolvedCases.length} closed
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "divider" }} />

      <Box sx={{ flex: 1, overflowY: "auto", py: 1.25 }}>
        <List disablePadding>
          {openCases.map((caseItem) => (
            <CaseListItem
              key={caseItem.id}
              caseItem={caseItem}
              selected={caseItem.id === selectedCaseId}
              onSelect={onSelectCase}
            />
          ))}
        </List>

        {resolvedCases.length > 0 && (
          <>
            <Typography
              variant="overline"
              sx={{
                px: 2.5,
                pt: 1.5,
                pb: 1,
                display: "block",
                color: "text.disabled",
                fontSize: "0.65rem",
              }}
            >
              Resolved
            </Typography>
            <List disablePadding>
              {resolvedCases.map((caseItem) => (
                <CaseListItem
                  key={caseItem.id}
                  caseItem={caseItem}
                  selected={caseItem.id === selectedCaseId}
                  onSelect={onSelectCase}
                />
              ))}
            </List>
          </>
        )}
      </Box>

      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.disabled",
            fontSize: "0.68rem",
            display: "block",
            lineHeight: 1.5,
          }}
        >
          Patients are waiting. Fix the queries before the system collapses.
        </Typography>
      </Box>
    </Box>
  );
}
