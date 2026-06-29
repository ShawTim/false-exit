// Lightweight content lint for the 3D build.
// Validates content/rooms.json structure (room count + required fields).
// Does NOT import world.js (ESM with CDN three) — rooms.json is the static contract.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const file = join(root, "content", "rooms.json");

let json;
try {
  json = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`[validate-rooms] FAIL: cannot parse ${file}: ${e.message}`);
  process.exit(1);
}

const errors = [];
if (typeof json.roomCount !== "number" || json.roomCount !== 5) {
  errors.push(`roomCount must be exactly 5 (got ${json.roomCount})`);
}
if (!Array.isArray(json.rooms) || json.rooms.length !== 5) {
  errors.push(`rooms[] must have exactly 5 entries (got ${json.rooms?.length})`);
} else {
  const req = ["id", "title", "type", "objective", "mechanic"];
  json.rooms.forEach((r, i) => {
    req.forEach((k) => {
      if (!r[k] || String(r[k]).trim() === "") errors.push(`rooms[${i}].${k} is empty`);
    });
    if (r.id !== `room-0${i + 1}`) errors.push(`rooms[${i}].id expected room-0${i + 1} (got ${r.id})`);
  });
}

if (errors.length) {
  console.error("[validate-rooms] FAIL:");
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log("[validate-rooms] OK: rooms.json has 5 rooms with required fields");
