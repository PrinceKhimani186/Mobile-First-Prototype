import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();

// Load environment variables from .env if present
if (fs.existsSync(path.join(rootDir, ".env"))) {
  const envContent = fs.readFileSync(path.join(rootDir, ".env"), "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim();
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const isWin = process.platform === "win32";
const execCmd = isWin ? "npx.cmd" : "npx";

console.log("🚀 Starting App Squad Frontend and API Backend Server...");

const apiEnv = {
  ...process.env,
  PORT: process.env.API_SERVER_PORT || "8080",
  NODE_ENV: "development",
};

const appEnv = {
  ...process.env,
  PORT: process.env.PORT || "5173",
  API_SERVER_PORT: process.env.API_SERVER_PORT || "8080",
  BASE_PATH: "/",
  NODE_ENV: "development",
};

const apiServer = spawn(execCmd, ["pnpm", "--filter", "@workspace/api-server", "run", "dev"], {
  cwd: rootDir,
  env: apiEnv,
  stdio: "inherit",
  shell: true,
});

const appSquad = spawn(execCmd, ["pnpm", "--filter", "@workspace/app-squad", "run", "dev"], {
  cwd: rootDir,
  env: appEnv,
  stdio: "inherit",
  shell: true,
});

function cleanup() {
  apiServer.kill();
  appSquad.kill();
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
