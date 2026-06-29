// Fixed acceptance entrypoint for the 3D build.
// Runs content guards in a fixed order; any failure => non-zero exit.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const guards = ["validate-rooms.mjs"];

let failed = false;
for (const g of guards) {
  const res = spawnSync("node", [join(here, g)], { stdio: "inherit" });
  if (res.status !== 0) failed = true;
}

if (failed) {
  console.error("[acceptance] FAIL: one or more guards failed");
  process.exit(1);
}
console.log("[acceptance] OK: content lint (rooms.json) passed");
