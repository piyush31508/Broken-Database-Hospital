"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress, Typography } from "@mui/material";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: "100%",
        minHeight: 280,
        display: "grid",
        placeItems: "center",
        bgcolor: "#0A1016",
      }}
    >
      <CircularProgress size={28} sx={{ color: "primary.main" }} />
    </Box>
  ),
});

type SqlEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: number | string;
};

export function SqlEditor({
  value,
  onChange,
  readOnly = false,
  height = 320,
}: SqlEditorProps) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#0A1016",
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.75,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(18, 26, 34, 0.9)",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: "var(--font-jetbrains-mono)",
            color: "text.secondary",
            letterSpacing: "0.06em",
          }}
        >
          query.sql
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: readOnly ? "text.disabled" : "primary.main",
            fontSize: "0.65rem",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          {readOnly ? "READ ONLY" : "EDITABLE · LIVE DATABASE"}
        </Typography>
      </Box>
      <MonacoEditor
        height={height}
        language="sql"
        theme="vs-dark"
        value={value}
        onChange={(next) => onChange?.(next ?? "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "line",
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          automaticLayout: true,
        }}
      />
    </Box>
  );
}
