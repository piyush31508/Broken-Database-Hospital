"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import type { CaseBrief } from "@/lib/types";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { CaseStatusBadge } from "@/components/ui/CaseStatusBadge";
import { SqlEditor } from "@/components/editor/SqlEditor";

type CasePanelProps = {
  caseItem: CaseBrief;
};

export function CasePanel({ caseItem }: CasePanelProps) {
  const [query, setQuery] = useState(caseItem.brokenQuery);

  useEffect(() => {
    setQuery(caseItem.brokenQuery);
  }, [caseItem.id, caseItem.brokenQuery]);

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        px: { xs: 2, md: 3.5 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ mb: 1.25, alignItems: "center", flexWrap: "wrap" }}
          >
            <Typography
              variant="overline"
              sx={{ color: "text.secondary", letterSpacing: "0.14em" }}
            >
              {caseItem.department} Ward · {caseItem.id.toUpperCase()}
            </Typography>
            <SeverityBadge severity={caseItem.severity} />
            <CaseStatusBadge status={caseItem.status} />
          </Stack>

          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "1.5rem", md: "1.85rem" },
              letterSpacing: "-0.02em",
              mb: 1,
            }}
          >
            {caseItem.title}
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              maxWidth: 720,
              lineHeight: 1.65,
              fontSize: "0.95rem",
            }}
          >
            {caseItem.summary}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ mt: 2, flexWrap: "wrap" }}
          >
            <Chip
              size="small"
              label={`+${caseItem.xpReward} XP`}
              sx={{
                bgcolor: "rgba(251,191,36,0.12)",
                color: "#FBBF24",
                border: "1px solid rgba(251,191,36,0.3)",
                fontWeight: 600,
              }}
            />
            <Chip
              size="small"
              label={`~${caseItem.estimatedMinutes} min`}
              sx={{
                bgcolor: "hospital.elevated",
                border: "1px solid",
                borderColor: "divider",
                color: "text.secondary",
              }}
            />
            {caseItem.tablesInvolved.map((table) => (
              <Chip
                key={table}
                size="small"
                icon={
                  <TableChartOutlinedIcon sx={{ fontSize: "14px !important" }} />
                }
                label={table}
                sx={{
                  bgcolor: "rgba(45,212,191,0.08)",
                  border: "1px solid rgba(45,212,191,0.25)",
                  color: "primary.light",
                  "& .MuiChip-icon": { color: "primary.main" },
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
            gap: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.25,
              bgcolor: "hospital.panel",
              borderRadius: 2.5,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ mb: 1.5, alignItems: "center" }}
            >
              <ScienceOutlinedIcon sx={{ fontSize: 18, color: "error.light" }} />
              <Typography
                variant="subtitle2"
                sx={{ letterSpacing: "0.04em", fontWeight: 700 }}
              >
                Observed Symptoms
              </Typography>
            </Stack>
            <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2.25 }}>
              {caseItem.symptoms.map((symptom) => (
                <Typography
                  component="li"
                  key={symptom}
                  sx={{ color: "text.secondary", fontSize: "0.875rem" }}
                >
                  {symptom}
                </Typography>
              ))}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.25,
              bgcolor: "hospital.panel",
              borderRadius: 2.5,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ mb: 1.5, alignItems: "center" }}
            >
              <LightbulbOutlinedIcon
                sx={{ fontSize: 18, color: "warning.main" }}
              />
              <Typography
                variant="subtitle2"
                sx={{ letterSpacing: "0.04em", fontWeight: 700 }}
              >
                Expected Outcome
              </Typography>
            </Stack>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}
            >
              {caseItem.expectedOutcome}
            </Typography>
          </Paper>
        </Box>

        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            useFlexGap
            sx={{
              mb: 1.5,
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ letterSpacing: "0.04em", fontWeight: 700 }}
              >
                Broken Query
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                Diagnose and rewrite — execution comes online in a later build.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap>
              <Button
                variant="outlined"
                size="small"
                disabled
                sx={{ borderColor: "divider", color: "text.disabled" }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled
                startIcon={<PlayArrowRoundedIcon />}
              >
                Run Query
              </Button>
            </Stack>
          </Stack>

          <SqlEditor value={query} onChange={setQuery} height={300} />
        </Box>

        <Divider sx={{ borderColor: "divider" }} />

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            bgcolor: "rgba(56,189,248,0.06)",
            borderColor: "rgba(56,189,248,0.2)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "secondary.light",
              letterSpacing: "0.1em",
              fontWeight: 700,
              display: "block",
              mb: 0.75,
            }}
          >
            TRAUMA BAY NOTICE
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
            Authentication and live PostgreSQL execution are not connected yet.
            This foundation is UI-only — select cases, inspect the broken SQL,
            and explore the hospital dashboard.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
