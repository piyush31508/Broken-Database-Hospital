"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { tryCreateAuthServerClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error: string | null;
  message: string | null;
};

export async function authenticate(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const intent = formData.get("intent");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (intent !== "signin" && intent !== "signup") {
    return { error: "Choose whether to sign in or create an account.", message: null };
  }

  if (!email || !password) {
    return { error: "Email and password are required.", message: null };
  }

  if (intent === "signup" && password.length < 8) {
    return { error: "Your password must be at least 8 characters.", message: null };
  }

  let supabase;
  try {
    supabase = await tryCreateAuthServerClient();
  } catch (error) {
    console.error("Unable to initialize Supabase authentication:", error);
    return {
      error: "Supabase authentication is not configured correctly.",
      message: null,
    };
  }

  if (!supabase) {
    return {
      error: "Supabase authentication is not configured.",
      message: null,
    };
  }

  if (intent === "signup") {
    let emailRedirectTo: string;

    try {
      const origin = (await headers()).get("origin");
      if (!origin) {
        throw new Error("Request origin is unavailable.");
      }
      emailRedirectTo = new URL("/auth/callback", origin).toString();
    } catch (error) {
      console.error("Unable to configure the email confirmation callback:", error);
      return {
        error: "Unable to start account registration. Please try again.",
        message: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });

    if (error) {
      return { error: error.message, message: null };
    }

    if (!data.session) {
      return {
        error: null,
        message: "Check your email for a confirmation link to finish creating your account.",
      };
    }

    redirect("/");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, message: null };
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await tryCreateAuthServerClient();
  if (!supabase) {
    throw new Error("Supabase authentication is not configured.");
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Supabase sign-out failed:", error);
    throw new Error("Unable to sign out. Please try again.");
  }

  redirect("/login");
}
