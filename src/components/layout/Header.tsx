"use client";

import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import type { HospitalStatus, PlayerStats } from "@/lib/types";
import { HospitalStatusBadge } from "@/components/player/HospitalStatusBadge";
import { XpBar } from "@/components/player/XpBar";
import { RankBadge } from "@/components/player/RankBadge";

type HeaderProps = {
  hospital: HospitalStatus;
  player: PlayerStats;
  onMenuClick: () => void;
};

export function Header({ hospital, player, onMenuClick }: HeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <AppBar position="sticky" color="transparent" elevation={0}>
      <Toolbar
        sx={{
          gap: 1.5,
          minHeight: { xs: 64, md: 72 },
          px: { xs: 1.5, md: 2.5 },
        }}
      >
        {isMobile && (
          <IconButton
            edge="start"
            onClick={onMenuClick}
            aria-label="Open cases"
            sx={{ color: "text.primary" }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            mr: { xs: 0, md: 2 },
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(145deg, rgba(244,63,94,0.3), rgba(45,212,191,0.2))",
              border: "1px solid rgba(45,212,191,0.35)",
              flexShrink: 0,
            }}
          >
            <MonitorHeartOutlinedIcon
              sx={{ fontSize: 20, color: "primary.main" }}
            />
          </Box>
          <Box sx={{ minWidth: 0, display: { xs: "none", sm: "block" } }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                whiteSpace: "nowrap",
              }}
            >
              Broken Database Hospital
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                letterSpacing: "0.08em",
                fontSize: "0.62rem",
              }}
            >
              SQL TRAUMA UNIT
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <HospitalStatusBadge hospital={hospital} compact={isMobile} />
        </Box>

        <XpBar player={player} />
        <RankBadge rank={player.rank} displayName={player.displayName} />
      </Toolbar>
    </AppBar>
  );
}
