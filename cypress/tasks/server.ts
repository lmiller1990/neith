import waitPort from "wait-port";
import url from "url";
import { PORT } from "../../src/shared/constants.js";
import { execa } from "execa";
import debugLib from "debug";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const debug = debugLib("notifier:cypress:task:server");

/**
 * See if the server is open by checking processes listening on port 4444.
 */
export async function isOpen() {
  try {
    // permissions for good measure
    await execa("chmod", ["+x", "./getpid.sh"], { cwd: __dirname });
    const { stdout } = await execa("./getpid.sh", {
      cwd: __dirname,
      shell: true,
    });
    debug(`stdout for lsof %s`, stdout);
    if (!stdout) {
      return {
        open: false,
      };
    }
    return {
      open: true,
      pids: stdout
        .trim()
        .split("\n")
        .map((x) => x.trim()),
    };
  } catch (e) {
    debug("error", e);
    return { open: false };
  }
}

export async function stopServer(): Promise<null> {
  const check = await isOpen();
  debug("stopping server %o", check);
  if (check.open && check.pids.length) {
    const cmd: [string, string[]] = ["kill", ["-9", ...check.pids]];
    debug(`killing %i with cmd: %o`, check.pids, cmd);
    try {
      await execa(...cmd);
    } catch (e) {
      debug("error killing server on %i: %s", e.message);
      //
    }
  }
  return null;
}

export async function startServer(): Promise<null> {
  const check = await isOpen();
  debug("check %o", check);

  if (check.open) {
    // Cypress task must resolve null to indicate success
    return null;
  }

  try {
    debug("starting server...");
    execa(`npm`, ["run", "server"]);
  } catch (e) {
    debug("error starting server %s", e.message);
  }

  debug("waiting for port %s", PORT);
  const { open } = await waitPort({
    host: "localhost",
    output: "silent",
    port: PORT,
  });

  if (open) {
    debug("started server");
    // Cypress task must resolve null to indicate success
    return null;
  }

  throw Error("Unknown error opening server");
}
