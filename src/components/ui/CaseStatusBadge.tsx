"use client";

import { Chip, useTheme } from "@mui/material";
import type { CaseStatus } from "@/lib/types";

const LABELS: Record<CaseStatus, string> = {
  active: "Open",
  diagnosing: "In Progress",
  resolved: "Resolved",
  locked: "Locked",
};

type CaseStatusBadgeProps = {
  status: CaseStatus;
};

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  const theme = useTheme();

  const colorMap: Record<CaseStatus, string> = {
    active: theme.palette.error.light,
    diagnosing: theme.palette.warning.main,
    resolved: theme.palette.success.main,
    locked: theme.palette.text.disabled,
  };

  const color = colorMap[status];

  return (
    <Chip
      label={LABELS[status]}
      size="small"
      sx={{
        height: 20,
        fontSize: "0.65rem",
        fontWeight: 600,
        bgcolor: "transparent",
        color,
        border: `1px solid ${color}44`,
        "& .MuiChip-label": { px: 0.75 },
      }}
    />
  );
}
