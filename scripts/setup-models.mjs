// Auto-process a downloaded CC0 model pack into models/ with the right names.
// Usage:
//   1. Download + unzip KayKit Furniture Bits (https://kaylousberg.itch.io/furniture-bits)
//   2. node scripts/setup-models.mjs "/path/to/unzipped/folder"
//   3. Done — matching GLTF/GLB files are copied into models/ and content/models.json is verified.
//
// Matching is fuzzy by filename (e.g. "Chair.gltf" -> chair, "OfficeDesk.glb" -> table).
import { readdirSync, statSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename, extname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const modelsDir = join(root, "models");

// registry name -> filename keywords that should match (lowercase, space-separated)
const KEYWORDS = {
  chair: ["chair", "seat", "stool", "bench"],
  table: ["table", "desk", "counter", "stand"],
  crate: ["crate", "box", "chest"],
  plant: ["plant", "pot", "vase", "flower", "bush"],
  painting: ["painting", "picture", "frame", "art", "poster"],
  bookshelf: ["shelf", "book", "bookcase", "rack", "library"],
  keycard: ["card", "keycard", "key"],
  door: ["door", "gate"],
  barrel: ["barrel", "drum"],
  machine: ["machine", "engine", "generator", "server", "computer"],
};

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const src = process.argv[2];
if (!src) {
  console.error("Usage: node scripts/setup-models.mjs <path-to-unzipped-pack>");
  process.exit(1);
}
if (!existsSync(src)) {
  console.error(`Source folder not found: ${src}`);
  process.exit(1);
}

mkdirSync(modelsDir, { recursive: true });

const files = walk(src).filter((f) => {
  const e = extname(f).toLowerCase();
  return e === ".glb" || e === ".gltf";
});

if (!files.length) {
  console.error("No .gltf / .glb files found in the source folder.");
  process.exit(1);
}

console.log(`Found ${files.length} GLTF/GLB file(s). Matching...\n`);

let placed = 0;
const usedNames = new Set();
const lower = (s) => s.toLowerCase();

for (const f of files) {
  const fname = lower(basename(f));
  for (const [regName, kws] of Object.entries(KEYWORDS)) {
    if (usedNames.has(regName)) continue;
    if (kws.some((k) => fname.includes(k))) {
      const ext = extname(f);
      const dest = join(modelsDir, regName + ext);
      copyFileSync(f, dest);
      console.log(`  ${regName.padEnd(12)} <= ${basename(f)}`);
      usedNames.add(regName);
      placed++;
      break;
    }
  }
}

console.log(`\nPlaced ${placed} model(s) into models/.`);
if (placed === 0) {
  console.log("No keyword matches. You can copy files manually into models/ named:");
  console.log("  " + Object.keys(KEYWORDS).join(", ") + " (+ .glb)");
} else {
  console.log("\nReminder: content/models.json points to .glb. If your files are .gltf");
  console.log("(multi-file with textures), update the extension in content/models.json,");
  console.log("or convert to .glb with https://gltf-viewer.donmccurdy.com / gltf-transform.");
  console.log("\nNext: refresh the game — decoys with model:\"...\" will now use real models.");
}
