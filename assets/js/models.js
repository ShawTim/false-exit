import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Model registry: logical name -> url (under models/).
// Populated from content/models.json at preload. Missing/404 files => null (fallback used).
const loader = new GLTFLoader();
const cache = new Map(); // name -> Group (null = tried & failed)
const registry = new Map();

/** Synchronous accessor for room builders (returns cached clone source or null). */
export function getModel(name) {
  if (!cache.has(name)) return null;
  return cache.get(name);
}

/** Get a fresh clone of a cached model (so rooms can dispose independently). */
export function getModelClone(name) {
  const src = cache.get(name);
  if (!src) return null;
  const clone = src.clone(true);
  // mark shared so room disposal skips these (resources belong to the cache)
  clone.traverse((o) => {
    o.userData = o.userData || {};
    o.userData._shared = true;
  });
  return clone;
}

export function register(name, url) {
  registry.set(name, url);
}

async function loadOne(name, url) {
  try {
    const gltf = await loader.loadAsync(url);
    const group = gltf.scene || gltf.scenes[0];
    group.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    cache.set(name, group);
    console.log(`[models] loaded: ${name}`);
  } catch (e) {
    cache.set(name, null); // graceful fallback
    console.log(`[models] fallback (no model): ${name}`);
  }
}

/** Preload all models listed in manifest. Resolves quickly if files missing. */
export async function preloadModels(manifestUrl = "content/models.json") {
  try {
    const res = await fetch(manifestUrl);
    const json = await res.json();
    const entries = Object.entries(json.models || {});
    await Promise.all(entries.map(([name, url]) => loadOne(name, url)));
  } catch (e) {
    console.log("[models] no manifest or parse error — using procedural fallbacks");
  }
}

/** Helper: prefer cached model, else build the fallback. */
export function prop(name, fallbackFn) {
  const m = getModelClone(name);
  return m || fallbackFn();
}
