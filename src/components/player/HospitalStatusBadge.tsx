"use client";

import { Box, Typography, useTheme } from "@mui/material";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import type { HospitalStatus } from "@/lib/types";
import { StatusPulse } from "@/components/ui/StatusPulse";

const STATUS_COPY: Record<
  HospitalStatus["status"],
  { label: string; detail: string }
> = {
  critical: {
    label: "SYSTEM CRITICAL",
    detail: "Database integrity failing",
  },
  unstable: {
    label: "SYSTEM UNSTABLE",
    detail: "Partial service degradation",
  },
  stable: {
    label: "SYSTEM STABLE",
    detail: "All wards reporting green",
  },
};

type HospitalStatusBadgeProps = {
  hospital: HospitalStatus;
  compact?: boolean;
};

export function HospitalStatusBadge({
  hospital,
  compact = false,
}: HospitalStatusBadgeProps) {
  const theme = useTheme();
  const copy = STATUS_COPY[hospital.status];

  const colorMap = {
    critical: theme.palette.error.main,
    unstable: theme.palette.warning.main,
    stable: theme.palette.success.main,
  } as const;

  const color = colorMap[hospital.status];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: compact ? 1.25 : 1.75,
        py: compact ? 0.75 : 1,
        borderRadius: 2,
        border: `1px solid ${color}44`,
        bgcolor: `${color}12`,
        minWidth: 0,
      }}
    >
      <StatusPulse color={color} size={9} />
      <LocalHospitalOutlinedIcon sx={{ fontSize: 18, color, opacity: 0.9 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color,
            fontWeight: 700,
            letterSpacing: "0.1em",
            lineHeight: 1.2,
            fontSize: "0.68rem",
          }}
        >
          {copy.label}
        </Typography>
        {!compact && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.7rem",
              display: { xs: "none", md: "block" },
            }}
          >
            {hospital.activeIncidents} incidents · {hospital.patientsWaiting}{" "}
            waiting · {hospital.uptimePercent}% uptime
          </Typography>
        )}
      </Box>
    </Box>
  );
}
