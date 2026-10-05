"use client";

import { Box, LinearProgress, Typography } from "@mui/material";

type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  trackColor?: string;
  height?: number;
  showValue?: boolean;
};

export function ProgressBar({
  value,
  max = 100,
  label,
  color = "#2DD4BF",
  trackColor = "#1A2430",
  height = 8,
  showValue = false,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <Box sx={{ width: "100%" }}>
      {(label || showValue) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.75,
          }}
        >
          {label && (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", letterSpacing: "0.06em" }}
            >
              {label}
            </Typography>
          )}
          {showValue && (
            <Typography
              variant="caption"
              sx={{ color: "text.primary", fontFamily: "var(--font-jetbrains-mono)" }}
            >
              {Math.round(value)} / {max}
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height,
          borderRadius: height,
          bgcolor: trackColor,
          "& .MuiLinearProgress-bar": {
            borderRadius: height,
            background: `linear-gradient(90deg, ${color}CC, ${color})`,
          },
        }}
      />
    </Box>
  );
}
