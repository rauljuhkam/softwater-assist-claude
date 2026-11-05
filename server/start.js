// Production startup: apply pending migrations, seed default personas
// (idempotently, without overwriting edits), then start Next.js bound to
// Railway's PORT on 0.0.0.0.
const { execSync } = require("child_process");
const { spawn } = require("child_process");

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit" });
}

try {
  run("pnpm exec prisma migrate deploy");
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exit(1);
}

try {
  run("pnpm exec tsx prisma/seed.ts");
} catch (error) {
  console.error("Seeding failed (continuing startup):", error.message);
}

const port = process.env.PORT || "3000";
const next = spawn("pnpm", ["exec", "next", "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  shell: true,
});

next.on("exit", (code) => process.exit(code ?? 0));
