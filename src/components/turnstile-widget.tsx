import Script from "next/script";
import { env } from "@/lib/env";

type TurnstileWidgetProps = {
  action: string;
};

export function TurnstileWidget({ action }: TurnstileWidgetProps) {
  if (!env.turnstileSiteKey) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        strategy="afterInteractive"
      />
      <div className="mt-5 overflow-hidden rounded-[18px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.72)] p-3">
        <div
          className="cf-turnstile"
          data-sitekey={env.turnstileSiteKey}
          data-action={action}
          data-theme="light"
        />
      </div>
    </>
  );
}
