"use client";

import { Box, Typography, Tooltip } from "@mui/material";
import MilitaryTechOutlinedIcon from "@mui/icons-material/MilitaryTechOutlined";
import type { PlayerRank } from "@/lib/types";

type RankBadgeProps = {
  rank: PlayerRank;
  displayName: string;
};

export function RankBadge({ rank, displayName }: RankBadgeProps) {
  return (
    <Tooltip title={`${displayName} · ${rank}`}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.25,
          py: 0.75,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "hospital.elevated",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(135deg, rgba(45,212,191,0.25), rgba(56,189,248,0.15))",
            border: "1px solid rgba(45,212,191,0.35)",
            flexShrink: 0,
          }}
        >
          <MilitaryTechOutlinedIcon
            sx={{ fontSize: 16, color: "primary.main" }}
          />
        </Box>
        <Box sx={{ minWidth: 0, display: { xs: "none", md: "block" } }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.primary",
              fontWeight: 600,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 120,
            }}
          >
            {displayName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "primary.main",
              fontSize: "0.65rem",
              letterSpacing: "0.06em",
              fontWeight: 600,
            }}
          >
            {rank.toUpperCase()}
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  );
}
