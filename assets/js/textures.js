import * as THREE from "three";

/* Procedural value noise -> tangent-space normal map (canvas).
   Gives real surface detail that reacts to lighting + shadows. */
function makeHeightField(size, scale, seed = 1) {
  const cells = Math.max(2, Math.round(scale));
  const grid = new Float32Array((cells + 1) * (cells + 1));
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < grid.length; i++) grid[i] = rnd();

  const field = new Float32Array(size * size);
  const lerp = (a, b, t) => a + (b - a) * t;
  const fade = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = (x / size) * cells;
      const gy = (y / size) * cells;
      const x0 = Math.floor(gx);
      const y0 = Math.floor(gy);
      const tx = fade(gx - x0);
      const ty = fade(gy - y0);
      const at = (xx, yy) => grid[(yy % cells) * (cells + 1) + (xx % cells)];
      const v = lerp(lerp(at(x0, y0), at(x0 + 1, y0), tx), lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), tx), ty);
      field[y * size + x] = v;
    }
  }
  return field;
}

export function makeNormalMap({ size = 256, scale = 8, strength = 1.0, octaves = 2, seed = 1 }) {
  // sum octaves into height
  const height = new Float32Array(size * size);
  let amp = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const f = makeHeightField(size, scale * Math.pow(2, o), seed + o * 13);
    for (let i = 0; i < height.length; i++) height[i] += f[i] * amp;
    total += amp;
    amp *= 0.5;
  }
  for (let i = 0; i < height.length; i++) height[i] /= total;

  // Sobel -> tangent-space normal
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  const at = (x, y) => height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tl = at(x - 1, y - 1), tc = at(x, y - 1), tr = at(x + 1, y - 1);
      const ml = at(x - 1, y), mr = at(x + 1, y);
      const bl = at(x - 1, y + 1), bc = at(x, y + 1), br = at(x + 1, y + 1);
      const dx = (tr + 2 * mr + br) - (tl + 2 * ml + bl);
      const dy = (bl + 2 * bc + br) - (tl + 2 * tc + tr);
      const nx = -dx * strength;
      const ny = -dy * strength;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const o = (y * size + x) * 4;
      img.data[o] = ((nx / len) * 0.5 + 0.5) * 255;
      img.data[o + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      img.data[o + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

// subtle roughness variation (dark = smoother/shinier spots)
export function makeRoughnessMap({ size = 128, scale = 6, seed = 7 }) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const field = makeHeightField(size, scale, seed);
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < field.length; i++) {
    const v = 120 + field[i] * 110;
    const o = i * 4;
    img.data[o] = img.data[o + 1] = img.data[o + 2] = v;
    img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
