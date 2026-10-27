/**
 * Reset (or create) the Supabase auth user for ADMIN_EMAIL with a new platform password.
 * Usage:
 *   node --env-file=.env.local scripts/reset-admin-password.mjs
 *   node --env-file=.env.local scripts/reset-admin-password.mjs 'YourPassword'
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i);
    let val = t.slice(i + 1);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!adminEmail) {
  console.error("Missing ADMIN_EMAIL in .env.local");
  process.exit(1);
}

function tempPassword() {
  return `WH-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listData, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
if (listError) {
  console.error("listUsers failed:", listError.message);
  process.exit(1);
}

const existing = (listData?.users ?? []).find((u) => u.email?.trim().toLowerCase() === adminEmail);
const customPassword = process.argv[2]?.trim();
const password = customPassword || tempPassword();

if (existing) {
  const { error } = await admin.auth.admin.updateUserById(existing.id, { password });
  if (error) {
    console.error("updateUser failed:", error.message);
    process.exit(1);
  }
  console.log(`Updated password for existing admin user (${adminEmail}).`);
} else {
  const { error } = await admin.auth.admin.createUser({
    email: adminEmail,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("createUser failed:", error.message);
    process.exit(1);
  }
  console.log(`Created new admin user (${adminEmail}).`);
}

console.log("\n--- Admin platform login (/login) ---");
console.log(`Email:    ${adminEmail}`);
console.log(`Password: ${password}`);
console.log("\nThis is NOT your SOF 4-digit code. SOF members use /sof-solutions/login.");
console.log("Set the same ADMIN_EMAIL in Vercel if production login should match.\n");
