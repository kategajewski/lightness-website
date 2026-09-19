import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  canAccessReikiRisingFall2026,
  getCurrentUserWithAccess,
} from "@/lib/member-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const documents = {
  "start-here": "reiki-rising-start-here-guide.pdf",
  "certification-practice-log": "reiki-rising-certification-practice-log.pdf",
} as const;

type MaterialRouteContext = {
  params: Promise<{ document: string }>;
};

export async function GET(request: Request, context: MaterialRouteContext) {
  const { user, accessRows } = await getCurrentUserWithAccess();

  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("error", "Please sign in to open your course.");
    return new Response(null, {
      status: 303,
      headers: {
        Location: login.toString(),
        "Cache-Control": "private, no-store",
      },
    });
  }

  if (!canAccessReikiRisingFall2026(user.email ?? "", accessRows)) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: new URL("/account", request.url).toString(),
        "Cache-Control": "private, no-store",
      },
    });
  }

  const { document } = await context.params;
  const filename = documents[document as keyof typeof documents];

  if (!filename) {
    return new Response("Not found", { status: 404 });
  }

  const file = await readFile(
    path.join(process.cwd(), "src/content/reiki-rising-fall-2026", filename),
  );
  const disposition = new URL(request.url).searchParams.get("download") === "1"
    ? "attachment"
    : "inline";

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(file.length),
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
