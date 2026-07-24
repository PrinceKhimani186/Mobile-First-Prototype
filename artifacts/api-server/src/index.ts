import dotenv from "dotenv";
import path from "path";
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

(global as any).WebSocket = class {};

import app from "./app";
import { logger } from "./lib/logger";
import { logZohoEnvironmentDiagnostics, verifyRefreshTokenOwnsTemplates } from "./routes/zoho";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Boot-time Zoho diagnostics — masked-prefix credential comparison (local vs
  // hosted) plus a best-effort confirmation that the refresh token's account
  // actually owns the Zoho Sign templates. Both are non-blocking and never throw.
  logZohoEnvironmentDiagnostics();
  void verifyRefreshTokenOwnsTemplates();
});
