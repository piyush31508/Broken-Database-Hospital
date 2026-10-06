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
  CircularProgress,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import type { CaseBrief } from "@/lib/types";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { CaseStatusBadge } from "@/components/ui/CaseStatusBadge";
import { SqlEditor } from "@/components/editor/SqlEditor";
import { QueryResult } from "@/components/editor/QueryResult";
import { validateCaseResult } from "@/lib/game/case-rules";

type CasePanelProps = {
  caseItem: CaseBrief;
  playerId: string;
  onCaseSolved: (caseId: string) => void;
};

type QueryState = {
  loading: boolean;
  rows: Record<string, unknown>[];
  rowCount: number;
  error: string | null;
  executed: boolean;
};

export function CasePanel({ caseItem, playerId, onCaseSolved }: CasePanelProps) {
  const [query, setQuery] = useState(caseItem.brokenQuery);
  const [caseSolved, setCaseSolved] = useState(false);
  const [caseMessage, setCaseMessage] = useState("");
  const [completionReported, setCompletionReported] =
  useState(false);
  
  const [queryState, setQueryState] = useState<QueryState>({
    loading: false,
    rows: [],
    rowCount: 0,
    error: null,
    executed: false,
  });

  useEffect(() => {
    setQuery(caseItem.brokenQuery);

    setQueryState({
      loading: false,
      rows: [],
      rowCount: 0,
      error: null,
      executed: false,
    });

    setCaseSolved(false);
    setCompletionReported(false);
    setCaseMessage("");
  }, [caseItem.id, caseItem.brokenQuery]);

  const handleReset = () => {
    setQuery(caseItem.brokenQuery);
  
    setQueryState({
      loading: false,
      rows: [],
      rowCount: 0,
      error: null,
      executed: false,
    });
  
    setCaseSolved(false);
    setCaseMessage("");
    setCompletionReported(false);
  };

  const handleRunQuery = async () => {
    if (!query.trim() || queryState.loading) {
      return;
    }
  
    setQueryState({
      loading: true,
      rows: [],
      rowCount: 0,
      error: null,
      executed: false,
    });
  
    setCaseSolved(false);
    setCaseMessage("");
  
    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          playerId,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        setQueryState({
          loading: false,
          rows: [],
          rowCount: 0,
          error: data.error ?? "Query execution failed.",
          executed: true,
        });
  
        return;
      }
  
      // Get the rows returned by PostgreSQL.
      const rows: Record<string, unknown>[] = Array.isArray(data.rows)
        ? data.rows
        : [];
  
      // Validate the actual database result for this case.
      const validation = validateCaseResult(
        caseItem.id,
        rows,
      );
      
      setCaseSolved(validation.solved);
      setCaseMessage(validation.message);
      
      if (validation.solved && !completionReported) {
        setCompletionReported(true);
        onCaseSolved(caseItem.id);
      }
      
      setQueryState({
        loading: false,
        rows,
        rowCount: data.rowCount ?? rows.length,
        error: null,
        executed: true,
      });
    } catch (error) {
      console.error("Query request failed:", error);
  
      setQueryState({
        loading: false,
        rows: [],
        rowCount: 0,
        error: "Could not connect to the query server.",
        executed: true,
      });
    }
  };

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
            sx={{
              mb: 1.25,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary",
                letterSpacing: "0.14em",
              }}
            >
              {caseItem.department} Ward ·{" "}
              {caseItem.id.toUpperCase()}
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
                  <TableChartOutlinedIcon
                    sx={{ fontSize: "14px !important" }}
                  />
                }
                label={table}
                sx={{
                  bgcolor: "rgba(45,212,191,0.08)",
                  border: "1px solid rgba(45,212,191,0.25)",
                  color: "primary.light",
                  "& .MuiChip-icon": {
                    color: "primary.main",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.1fr 0.9fr",
            },
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
              sx={{
                mb: 1.5,
                alignItems: "center",
              }}
            >
              <ScienceOutlinedIcon
                sx={{
                  fontSize: 18,
                  color: "error.light",
                }}
              />

              <Typography
                variant="subtitle2"
                sx={{
                  letterSpacing: "0.04em",
                  fontWeight: 700,
                }}
              >
                Observed Symptoms
              </Typography>
            </Stack>

            <Stack
              component="ul"
              spacing={1}
              sx={{ m: 0, pl: 2.25 }}
            >
              {caseItem.symptoms.map((symptom) => (
                <Typography
                  component="li"
                  key={symptom}
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.875rem",
                  }}
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
              sx={{
                mb: 1.5,
                alignItems: "center",
              }}
            >
              <LightbulbOutlinedIcon
                sx={{
                  fontSize: 18,
                  color: "warning.main",
                }}
              />

              <Typography
                variant="subtitle2"
                sx={{
                  letterSpacing: "0.04em",
                  fontWeight: 700,
                }}
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
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  letterSpacing: "0.04em",
                  fontWeight: 700,
                }}
              >
                Broken Query
              </Typography>

              <Typography
                variant="caption"
                sx={{ color: "text.disabled" }}
              >
                Diagnose and rewrite the query.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap>
              <Button
                variant="outlined"
                size="small"
                onClick={handleReset}
                disabled={queryState.loading}
                sx={{
                  borderColor: "divider",
                  color: "text.secondary",
                }}
              >
                Reset
              </Button>

              <Button
                variant="contained"
                size="small"
                onClick={handleRunQuery}
                disabled={queryState.loading || !query.trim()}
                startIcon={
                  queryState.loading ? (
                    <CircularProgress
                      size={14}
                      color="inherit"
                    />
                  ) : (
                    <PlayArrowRoundedIcon />
                  )
                }
              >
                {queryState.loading ? "Running..." : "Run Query"}
              </Button>
            </Stack>
          </Stack>

          <SqlEditor
            value={query}
            onChange={setQuery}
            height={300}
          />

          {queryState.executed && (
            <QueryResult
              rows={queryState.rows}
              rowCount={queryState.rowCount}
              error={queryState.error}
            />
          )}

{queryState.executed &&
  !queryState.error &&
  caseMessage && (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: caseSolved
          ? "rgba(34,197,94,0.08)"
          : "rgba(251,191,36,0.06)",
        border: "1px solid",
        borderColor: caseSolved
          ? "rgba(34,197,94,0.25)"
          : "rgba(251,191,36,0.2)",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mb: 0.5,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: caseSolved
            ? "success.main"
            : "warning.main",
        }}
      >
        {caseSolved
          ? "✓ DIAGNOSIS CONFIRMED"
          : "DIAGNOSIS INCOMPLETE"}
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          fontSize: "0.85rem",
          lineHeight: 1.5,
        }}
      >
        {caseMessage}
      </Typography>
    </Paper>
  )}
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
            LIVE DATABASE
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.85rem",
            }}
          >
            PostgreSQL execution is online. Queries run against
            the hospital database in read-only mode.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}