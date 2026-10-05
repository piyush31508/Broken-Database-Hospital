"use client";

import { Box, keyframes } from "@mui/material";

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.85); }
`;

const ring = keyframes`
  0% { transform: scale(1); opacity: 0.55; }
  100% { transform: scale(2.2); opacity: 0; }
`;

type StatusPulseProps = {
  color: string;
  size?: number;
  animated?: boolean;
};

export function StatusPulse({
  color,
  size = 8,
  animated = true,
}: StatusPulseProps) {
  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      {animated && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            bgcolor: color,
            animation: `${ring} 1.6s ease-out infinite`,
          }}
        />
      )}
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          bgcolor: color,
          animation: animated ? `${pulse} 1.6s ease-in-out infinite` : "none",
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </Box>
  );
}
