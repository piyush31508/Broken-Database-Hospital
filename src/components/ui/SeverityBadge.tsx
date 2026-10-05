"use client";

import { Chip, useTheme } from "@mui/material";
import type { CaseSeverity } from "@/lib/types";

const LABELS: Record<CaseSeverity, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  moderate: "MODERATE",
  low: "LOW",
};

type SeverityBadgeProps = {
  severity: CaseSeverity;
  size?: "small" | "medium";
};

export function SeverityBadge({ severity, size = "small" }: SeverityBadgeProps) {
  const theme = useTheme();

  const colorMap: Record<CaseSeverity, string> = {
    critical: theme.palette.error.main,
    high: theme.palette.warning.main,
    moderate: theme.palette.secondary.main,
    low: theme.palette.text.secondary,
  };

  const color = colorMap[severity];

  return (
    <Chip
      label={LABELS[severity]}
      size={size}
      sx={{
        height: size === "small" ? 22 : 28,
        fontSize: size === "small" ? "0.65rem" : "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        borderRadius: 1,
        bgcolor: `${color}18`,
        color,
        border: `1px solid ${color}55`,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}
