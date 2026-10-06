import type { Metadata } from "next";
import { Box } from "@mui/material";
import { AuthForm } from "@/components/auth/AuthForm";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Create account | Broken Database Hospital",
};

export default function SignUpPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 5,
        background:
          "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(45,212,191,0.1), transparent 70%)",
      }}
    >
      <AuthForm mode="signup" configured={isSupabaseAuthConfigured()} />
    </Box>
  );
}
