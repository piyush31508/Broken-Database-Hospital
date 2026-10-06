"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import { authenticate } from "@/app/login/actions";

type AuthFormProps = {
  mode: "signin" | "signup";
  configured: boolean;
  callbackError?: string | null;
};

const initialState = { error: null, message: null };

export function AuthForm({
  mode,
  configured,
  callbackError,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(
    authenticate,
    initialState,
  );
  const isSignUp = mode === "signup";

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 440,
        p: { xs: 3, sm: 4 },
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        borderRadius: 3,
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              mb: 2.5,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              bgcolor: "rgba(45,212,191,0.1)",
              border: "1px solid rgba(45,212,191,0.25)",
            }}
          >
            <MonitorHeartOutlinedIcon />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {isSignUp ? "Join the care team" : "Welcome back, Doctor"}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            {isSignUp
              ? "Create an account to start repairing the hospital database."
              : "Sign in to continue your SQL diagnosis."}
          </Typography>
        </Box>

        {callbackError === "confirmation" && (
          <Alert severity="error">
            That confirmation link is invalid or has expired. Request a new one
            by creating an account again.
          </Alert>
        )}
        {callbackError === "configuration" && (
          <Alert severity="error">
            Add your Supabase URL and publishable key to the environment before
            signing in.
          </Alert>
        )}
        {!configured && (
          <Alert severity="warning">
            Authentication needs <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> (or the legacy
            anon key) in <code>.env.local</code>.
          </Alert>
        )}
        {state.error && <Alert severity="error">{state.error}</Alert>}
        {state.message && <Alert severity="success">{state.message}</Alert>}

        <Box component="form" action={formAction}>
          <Stack spacing={2}>
            <input type="hidden" name="intent" value={mode} />
            <TextField
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              required
              fullWidth
              disabled={!configured || pending}
            />
            <TextField
              name="password"
              type="password"
              label="Password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              fullWidth
              slotProps={{
                htmlInput: { minLength: isSignUp ? 8 : undefined },
              }}
              disabled={!configured || pending}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!configured || pending}
              sx={{ minHeight: 48, fontWeight: 700 }}
            >
              {pending
                ? "Please wait..."
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          {isSignUp ? "Already have an account?" : "New to the hospital?"}{" "}
          <Box
            component={Link}
            href={isSignUp ? "/login" : "/signup"}
            sx={{
              color: "primary.main",
              fontWeight: 600,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {isSignUp ? "Sign in" : "Create an account"}
          </Box>
        </Typography>
      </Stack>
    </Paper>
  );
}
