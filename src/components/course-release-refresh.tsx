"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CourseReleaseRefresh({ nextReleaseAt, serverNow }: { nextReleaseAt: number | null; serverNow: number }) {
  const router = useRouter();
  useEffect(() => {
    if (nextReleaseAt === null) return;
    // The server, not the student's device clock, determines the release boundary.
    const timer = window.setTimeout(() => router.refresh(), Math.min(Math.max(nextReleaseAt - serverNow + 1000, 1000), 86400000));
    const refreshOnReturn = () => { if (document.visibilityState === "visible") router.refresh(); };
    document.addEventListener("visibilitychange", refreshOnReturn);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [nextReleaseAt, serverNow, router]);
  return null;
}
