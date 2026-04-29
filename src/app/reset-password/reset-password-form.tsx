"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "loading" | "ready" | "submitting" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      if (data.session) {
        setStatus("ready");
        return;
      }

      setStatus("error");
      setMessage(
        "Auth session missing. Please open the newest password reset email and use that link directly.",
      );
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" || session) {
        setStatus("ready");
        setMessage("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status !== "ready") {
      setStatus("error");
      setMessage(
        "Please open the reset page from the newest password recovery email.",
      );
      return;
    }

    if (!password || !confirmPassword) {
      setStatus("error");
      setMessage("Please enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Password updated. You can now return to login.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
      {status === "loading" ? (
        <p className="rounded-[18px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.86)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
          Waiting for recovery session...
        </p>
      ) : null}

      {status === "success" ? (
        <p className="rounded-[18px] border border-[rgba(124,163,130,0.22)] bg-[rgba(168,178,159,0.22)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
          {message}
        </p>
      ) : null}

      {status === "error" ? (
        <p className="rounded-[18px] border border-[rgba(160,95,88,0.18)] bg-[rgba(201,167,156,0.18)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
          {message}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
            New Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
            Confirm Password
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={status === "submitting" || status === "loading"}
          className="button-pill disabled:opacity-70"
        >
          {status === "submitting" ? "Saving..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
