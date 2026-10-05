"use client";

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    hospital: {
      critical: string;
      warning: string;
      stable: string;
      monitor: string;
      panel: string;
      elevated: string;
      border: string;
    };
  }
  interface PaletteOptions {
    hospital?: {
      critical?: string;
      warning?: string;
      stable?: string;
      monitor?: string;
      panel?: string;
      elevated?: string;
      border?: string;
    };
  }
}

export const hospitalTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#2DD4BF",
      light: "#5EEAD4",
      dark: "#0F766E",
      contrastText: "#042F2E",
    },
    secondary: {
      main: "#38BDF8",
      light: "#7DD3FC",
      dark: "#0284C7",
    },
    error: {
      main: "#F43F5E",
      light: "#FB7185",
      dark: "#BE123C",
    },
    warning: {
      main: "#F59E0B",
      light: "#FBBF24",
      dark: "#D97706",
    },
    success: {
      main: "#34D399",
      light: "#6EE7B7",
      dark: "#059669",
    },
    background: {
      default: "#070B10",
      paper: "#0E141B",
    },
    text: {
      primary: "#E8EEF4",
      secondary: "#8B9AAB",
      disabled: "#5A6B7D",
    },
    divider: "#1E2A36",
    hospital: {
      critical: "#F43F5E",
      warning: "#F59E0B",
      stable: "#34D399",
      monitor: "#2DD4BF",
      panel: "#121A22",
      elevated: "#1A2430",
      border: "#1E2A36",
    },
  },
  typography: {
    fontFamily: "var(--font-ibm-plex-sans), 'IBM Plex Sans', sans-serif",
    h1: { fontWeight: 600, letterSpacing: "-0.02em" },
    h2: { fontWeight: 600, letterSpacing: "-0.02em" },
    h3: { fontWeight: 600, letterSpacing: "-0.01em" },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
    overline: {
      letterSpacing: "0.12em",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#070B10",
          color: "#E8EEF4",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          variants: [
            {
              props: { color: "primary" },
              style: {
                backgroundImage:
                  "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)",
              },
            },
          ],
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #1E2A36",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: "#0E141B",
          borderRight: "1px solid #1E2A36",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(14, 20, 27, 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1E2A36",
          boxShadow: "none",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#1A2430",
          border: "1px solid #1E2A36",
          fontSize: "0.75rem",
        },
      },
    },
  },
});
