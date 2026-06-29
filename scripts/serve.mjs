// No-cache static server for False Exit 3D dev.
// Usage: node scripts/serve.mjs [port]
import http from "node:http";

const port = Number(process.argv[2] || 8080);
const root = new URL("../", import.meta.url);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  import("node:fs").then((fs) => {
    import("node:path").then((path) => {
      const filePath = path.join(fileURLToPath(root), pathname);
      // prevent path traversal
      if (!filePath.startsWith(fileURLToPath(root))) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not found");
          return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, {
          "Content-Type": TYPES[ext] || "application/octet-stream",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        });
        res.end(data);
      });
    });
  });
});

function fileURLToPath(u) {
  return new URL(u).pathname.replace(/^\/([A-Z]:)/, "$1");
}

server.listen(port, () => {
  console.log(`False Exit 3D dev server (no-cache):`);
  console.log(`  http://localhost:${port}/`);
});
