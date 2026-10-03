"use client";

import { useState } from "react";

export function ReikiLessonPlayer({ slug, title, duration, preview = false, replay = false }: {
  slug: string; title: string; duration: string; preview?: boolean; replay?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openVideo() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/library/reiki-rising-fall-2026/videos/${slug}${preview ? "?preview=1" : ""}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "Unable to load your lesson. Please try again.");
      setUrl(data.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load your lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="border-t border-[rgba(76,58,48,0.12)] py-4">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{duration}</p>
      {url ? (
        <div className="mt-4">
          <iframe src={url} title={title} className="aspect-video w-full border-0" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          <button type="button" onClick={() => setUrl("")} className="mt-3 text-sm underline underline-offset-4">Close video</button>
        </div>
      ) : (
        <button type="button" onClick={openVideo} disabled={loading} className="button-pill mt-3 disabled:opacity-60">
          {loading ? "Loading..." : preview ? "Preview lesson (admin only)" : replay ? "Watch replay" : "Watch lesson"}
        </button>
      )}
      {error && <p role="alert" className="mt-3 text-sm">{error} <a href="/login" className="underline">Sign in</a> / <a href="/contact" className="underline">Contact Kate</a></p>}
    </li>
  );
}
