import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';

import { createEmrApi } from './emrApi.ts';
import { toHttpError } from './postgresError.ts';

type Dependencies = Parameters<typeof createEmrApi>[0];

export function createNodeServer(dependencies: Dependencies) {
  const handleRequest = createEmrApi(dependencies);

  return createServer(async (req, res) => {
    try {
      const response = await handleRequest(await toHttpRequest(req));
      writeJson(res, response.status, response.body, response.headers);
    } catch (error) {
      const httpError = toHttpError(error);

      writeJson(
        res,
        httpError.status,
        httpError.body,
        { 'content-type': 'application/json; charset=utf-8' }
      );
    }
  });
}

async function toHttpRequest(req: IncomingMessage) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const rawBody = await readRequestBody(req);

  return {
    method: req.method ?? 'GET',
    path: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
    ),
    body: rawBody.length > 0 ? JSON.parse(rawBody) : undefined,
  };
}

async function readRequestBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString('utf8');
}

function writeJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  headers?: Record<string, string>
) {
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}
