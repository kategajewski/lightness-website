#!/usr/bin/env node

import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  if (!fs.existsSync(file)) return;

  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[match[1]] ||= value;
  }
}

loadEnv("web/.env.local");
loadEnv(".env.local");

const emails = process.argv
  .slice(2)
  .map((email) => email.trim())
  .filter(Boolean);

if (emails.length === 0) {
  console.error(
    "Usage: node scripts/generate-portal-setup-links.mjs student@email.com",
  );
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl =
  process.env.PORTAL_SETUP_SITE_URL || "https://bethelightness.com";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

for (const email of emails) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/create-password`,
    },
  });

  if (error) {
    console.error(`${email}: ${error.message}`);
    continue;
  }

  const setupUrl = new URL("/portal-setup", siteUrl);
  setupUrl.searchParams.set("token", data.properties.hashed_token);
  setupUrl.searchParams.set("type", data.properties.verification_type);

  console.log(`${email}`);
  console.log(setupUrl.toString());
  console.log("");
}
