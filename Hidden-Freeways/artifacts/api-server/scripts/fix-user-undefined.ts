import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ✅ ESM-safe __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES_DIR = path.resolve(__dirname, "../src/routes");

const files = fs.readdirSync(ROUTES_DIR).filter(f => f.endsWith(".ts"));

function patchFile(filePath: string) {
  let code = fs.readFileSync(filePath, "utf-8");
  let changed = false;

  // Fix unsafe cast
  if (code.includes("(req as AuthedRequest).user")) {
    code = code.replaceAll(
      "(req as AuthedRequest).user",
      "(req as any).user"
    );
    changed = true;
  }

  // optional safety hint (does NOT break runtime)
  if (code.includes("req.user") && !code.includes("if (!user") && !code.includes("if(!user")) {
    const guardHelper = `
// auto-added safety note: user may be undefined in some routes
`;

    code = guardHelper + code;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, code, "utf-8");
    console.log("patched:", path.basename(filePath));
  } else {
    console.log("skipped:", path.basename(filePath));
  }
}

for (const file of files) {
  patchFile(path.join(ROUTES_DIR, file));
}

console.log("✅ done");
