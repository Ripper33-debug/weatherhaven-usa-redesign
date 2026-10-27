/**
 * Interactive admin password reset (no .env.local required).
 * Run: npm run admin:reset-password:interactive
 */
import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });

function tempPassword() {
  return `WH-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

try {
  output.write("\nWeatherhaven — reset admin password for /login\n\n");
  output.write("Open Vercel → your project → Settings → Environment Variables (Production).\n");
  output.write("Copy NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ADMIN_EMAIL.\n\n");

  const url = await rl.question("NEXT_PUBLIC_SUPABASE_URL: ");
  output.write("(service role key will be visible as you paste — that is OK in your own terminal)\n");
  const serviceKey = await rl.question("SUPABASE_SERVICE_ROLE_KEY: ");
  const adminEmail = (await rl.question("ADMIN_EMAIL: ")).trim().toLowerCase();
  const customPw = await rl.question("New password (press Enter for auto WH-...): ");

  if (!url.trim() || !serviceKey.trim() || !adminEmail) {
    console.error("\nAll three fields are required.");
    process.exit(1);
  }

  const password = customPw.trim() || tempPassword();
  const admin = createClient(url.trim(), serviceKey.trim(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: listData, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    console.error("\nCould not reach Supabase:", listError.message);
    console.error("Check URL and service_role key (not anon key).");
    process.exit(1);
  }

  const existing = (listData?.users ?? []).find((u) => u.email?.trim().toLowerCase() === adminEmail);

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, { password });
    if (error) {
      console.error("\nPassword update failed:", error.message);
      process.exit(1);
    }
    console.log(`\nUpdated password for ${adminEmail}`);
  } else {
    const { error } = await admin.auth.admin.createUser({
      email: adminEmail,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error("\nCreate user failed:", error.message);
      process.exit(1);
    }
    console.log(`\nCreated new admin user ${adminEmail}`);
  }

  console.log("\n========================================");
  console.log("Sign in here: https://weatherhavenusa.com/login");
  console.log(`Email:    ${adminEmail}`);
  console.log(`Password: ${password}`);
  console.log("========================================\n");
} finally {
  rl.close();
}
