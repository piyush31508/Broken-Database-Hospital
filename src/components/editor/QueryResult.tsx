"use client";

import {
  Alert,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type QueryResultProps = {
  rows: Record<string, unknown>[];
  rowCount: number;
  error?: string | null;
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function QueryResult({
  rows,
  rowCount,
  error,
}: QueryResultProps) {
  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert
          severity="error"
          sx={{
            bgcolor: "rgba(244,63,94,0.08)",
            border: "1px solid rgba(244,63,94,0.25)",
            color: "error.light",
            "& .MuiAlert-icon": {
              color: "error.main",
            },
          }}
        >
          <Typography
            sx={{
              fontFamily:
                "var(--font-jetbrains-mono), monospace",
              fontSize: "0.8rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2,
          bgcolor: "rgba(251,191,36,0.06)",
          border: "1px solid rgba(251,191,36,0.2)",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "warning.main",
            fontWeight: 700,
            letterSpacing: "0.08em",
            display: "block",
            mb: 0.5,
          }}
        >
          QUERY EXECUTED
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "0.85rem",
          }}
        >
          0 rows returned.
        </Typography>
      </Paper>
    );
  }

  const columns = Object.keys(rows[0]);

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            Query Result
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "success.main" }}
          >
            {rowCount} {rowCount === 1 ? "row" : "rows"} returned
          </Typography>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          maxHeight: 360,
          bgcolor: "#0A1016",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            "& .MuiTableCell-root": {
              borderColor: "divider",
              fontFamily:
                "var(--font-jetbrains-mono), monospace",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
            },
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column}
                  sx={{
                    bgcolor: "#121A22",
                    color: "primary.light",
                    fontWeight: 700,
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell
                    key={column}
                    sx={{
                      color:
                        row[column] === null
                          ? "text.disabled"
                          : "text.secondary",
                    }}
                  >
                    {formatValue(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}