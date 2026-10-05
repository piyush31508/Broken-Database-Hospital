"use client";

import { Box, Typography, Tooltip } from "@mui/material";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import type { PlayerStats } from "@/lib/types";
import { ProgressBar } from "@/components/ui/ProgressBar";

type XpBarProps = {
  player: PlayerStats;
  compact?: boolean;
};

export function XpBar({ player, compact = false }: XpBarProps) {
  return (
    <Tooltip title={`${player.xp} / ${player.xpToNextRank} XP to next rank`}>
      <Box
        sx={{
          minWidth: compact ? 100 : 160,
          maxWidth: 220,
          display: { xs: "none", sm: "block" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.5,
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <BoltOutlinedIcon sx={{ fontSize: 14, color: "#FBBF24" }} />
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                letterSpacing: "0.08em",
                fontWeight: 600,
                fontSize: "0.65rem",
              }}
            >
              XP
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "var(--font-jetbrains-mono)",
              color: "#FBBF24",
              fontSize: "0.7rem",
            }}
          >
            {player.xp.toLocaleString()}
          </Typography>
        </Box>
        <ProgressBar
          value={player.xp}
          max={player.xpToNextRank}
          color="#FBBF24"
          height={6}
        />
      </Box>
    </Tooltip>
  );
}
