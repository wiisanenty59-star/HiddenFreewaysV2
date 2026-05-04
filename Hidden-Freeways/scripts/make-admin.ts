import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import "dotenv/config";
const username = process.argv[2];

if (!username) {
  console.error("Usage: pnpm tsx scripts/make-admin.ts <username>");
  process.exit(1);
}

async function makeAdmin() {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!user.length) {
    console.error(`User "${username}" not found`);
    process.exit(1);
  }

  await db
    .update(usersTable)
    .set({ role: "admin" })
    .where(eq(usersTable.username, username));

  console.log(`✅ ${username} is now ADMIN`);
}

makeAdmin().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
