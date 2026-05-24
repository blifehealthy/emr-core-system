import { createReadStream, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const frontendDir = join(rootDir, 'frontend');
const port = Number(process.env.FRONTEND_PORT ?? '5173');
const host = process.env.FRONTEND_HOST ?? '127.0.0.1';
const apiBaseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:3000';

const mimeTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (url.pathname === '/health' || url.pathname.startsWith('/api/')) {
      await proxyApiRequest(req, res, url);
      return;
    }

    await serveStaticFile(res, url.pathname);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown frontend server error';
    writeJson(res, 500, { error: message });
  }
});

server.listen(port, host, () => {
  console.log(`EMR frontend listening on http://${host}:${port}`);
  console.log(`Proxying API requests to ${apiBaseUrl}`);
});

async function proxyApiRequest(req: IncomingMessage, res: ServerResponse, url: URL) {
  const targetUrl = `${apiBaseUrl}${url.pathname}${url.search}`;
  const body = await readBody(req);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || ['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      continue;
    }

    headers.set(key, Array.isArray(value) ? value[0] : value);
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: body.length > 0 ? body : undefined,
  });

  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  res.end(Buffer.from(await response.arrayBuffer()));
}

async function serveStaticFile(res: ServerResponse, requestPath: string) {
  const pathname = requestPath === '/' ? '/index.html' : requestPath;
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(frontendDir, normalized);

  if (!filePath.startsWith(frontendDir) || !existsSync(filePath)) {
    await serveIndex(res);
    return;
  }

  res.writeHead(200, { 'content-type': mimeTypes[extname(filePath)] ?? 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
}

async function serveIndex(res: ServerResponse) {
  const html = await readFile(join(frontendDir, 'index.html'), 'utf8');
  res.writeHead(200, { 'content-type': mimeTypes['.html'] });
  res.end(html);
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function writeJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': mimeTypes['.json'] });
  res.end(JSON.stringify(body));
}
