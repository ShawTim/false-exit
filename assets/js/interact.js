import * as THREE from "three";

export function createInteractor({ camera }) {
  const raycaster = new THREE.Raycaster();
  raycaster.far = 3.0;
  const center = new THREE.Vector2(0, 0);

  let current = null;
  const HL_COLOR = 0x2a5a6a;
  const onPromptCbs = new Set();

  function onPrompt(cb) {
    onPromptCbs.add(cb);
    return () => onPromptCbs.delete(cb);
  }

  function setHighlight(obj, on) {
    if (!obj) return;
    obj.traverse((child) => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      if (on) {
        if (!child.userData._hlOrig) {
          child.userData._hlOrig = child.material;
          // clone so each instance is independent (GLTF clones share materials)
          const cloned = Array.isArray(child.material)
            ? child.material.map(cloneMatHL)
            : cloneMatHL(child.material);
          child.material = cloned;
        }
      } else {
        if (child.userData._hlOrig !== undefined) {
          child.material = child.userData._hlOrig;
          delete child.userData._hlOrig;
        }
      }
    });
  }

  function cloneMatHL(mat) {
    const m = mat.clone();
    if (m.emissive) {
      m.emissive = m.emissive.clone();
      m.emissive.setHex(HL_COLOR);
    }
    if ("emissiveIntensity" in m) m.emissiveIntensity = 1.6;
    return m;
  }

  function findRoot(obj) {
    let n = obj;
    while (n) {
      if (n.userData && n.userData.interactable) return n;
      n = n.parent;
    }
    return null;
  }

  function update(interactables) {
    raycaster.setFromCamera(center, camera);
    let hit = null;
    if (interactables && interactables.length) {
      const meshes = interactables.map((i) => (i.isObject3D ? i : i.object));
      const hits = raycaster.intersectObjects(meshes, true);
      for (const h of hits) {
        const root = findRoot(h.object);
        if (root && root.userData.enabled !== false) {
          hit = root;
          break;
        }
      }
    }

    if (hit !== current) {
      setHighlight(current, false);
      current = hit;
      setHighlight(current, true);
      const prompt = current ? current.userData.prompt : null;
      onPromptCbs.forEach((cb) => cb(prompt));
    }
  }

  function consume() {
    if (!current) return false;
    const fn = current.userData.onInteract;
    if (typeof fn === "function") fn();
    return true;
  }

  function clear() {
    setHighlight(current, false);
    current = null;
    onPromptCbs.forEach((cb) => cb(null));
  }

  return { update, consume, clear, onPrompt, get current() { return current; } };
}
