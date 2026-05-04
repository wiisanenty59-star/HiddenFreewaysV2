import fs from "fs";
import path from "path";

const ROUTES_DIR = path.join(__dirname, "../src/routes");

const files = fs.readdirSync(ROUTES_DIR).filter(f => f.endsWith(".ts"));

const guardSnippet = `
function requireUser(req: any, res: any): asserts req is any {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    throw new Error("Unauthorized");
  }
}
`;

for (const file of files) {
  const filePath = path.join(ROUTES_DIR, file);
  let content = fs.readFileSync(filePath, "utf-8");

  // Skip if already patched
  if (content.includes("requireUser(")) {
    console.log(`Skipping (already patched): ${file}`);
    continue;
  }

  // Only patch files that actually use req.user
  if (!content.includes("req.user")) {
    console.log(`Skipping (no auth usage): ${file}`);
    continue;
  }

  console.log(`Patching: ${file}`);

  // Inject after router declaration if possible
  const routerIndex = content.indexOf("const router");

  if (routerIndex !== -1) {
    const insertPos = content.indexOf("\n", routerIndex) + 1;
    content =
      content.slice(0, insertPos) +
      guardSnippet +
      "\n" +
      content.slice(insertPos);
  } else {
    // fallback: just prepend
    content = guardSnippet + "\n" + content;
  }

  fs.writeFileSync(filePath, content, "utf-8");
}

console.log("Done patching auth guards.");
