import { createServer } from "node:http";
import {
  ConfigurationError,
  listInstagramAccounts,
  testInstagramConnection,
} from "./composio.js";

/**
 * Minimal deployable API boundary between the browser and Composio.
 * The browser only ever talks to these routes; the Composio API key
 * never leaves this process.
 */

const PORT = Number(process.env.PORT ?? 8787);

function sendJson(res: import("node:http").ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function errorStatus(e: unknown): number {
  return e instanceof ConfigurationError ? 503 : 502;
}

function errorBody(e: unknown): { error: string } {
  const message = e instanceof Error ? e.message : String(e);
  // Cap length so upstream stack dumps never flood the client.
  return { error: message.slice(0, 500) };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const route = `${req.method} ${url.pathname}`;

  try {
    if (route === "GET /api/health") {
      sendJson(res, 200, {
        ok: true,
        composioConfigured: Boolean(process.env.COMPOSIO_API_KEY),
        identityToolConfigured: Boolean(process.env.COMPOSIO_INSTAGRAM_IDENTITY_TOOL),
      });
      return;
    }

    if (route === "GET /api/social/instagram/accounts") {
      const accounts = await listInstagramAccounts();
      sendJson(res, 200, { accounts });
      return;
    }

    if (route === "GET /api/social/instagram/test") {
      const connectionId = url.searchParams.get("connectionId");
      if (!connectionId) {
        sendJson(res, 400, { error: "Missing required query parameter: connectionId" });
        return;
      }
      const result = await testInstagramConnection(connectionId);
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (e) {
    console.error(`[server] ${route} failed:`, e instanceof Error ? e.message : e);
    sendJson(res, errorStatus(e), errorBody(e));
  }
});

server.listen(PORT, () => {
  console.log(`[server] API boundary listening on http://localhost:${PORT}`);
  if (!process.env.COMPOSIO_API_KEY) {
    console.warn("[server] COMPOSIO_API_KEY is not set — real-mode requests will return an honest 503.");
  }
});
