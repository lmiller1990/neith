import { resetdb, runAllMigrations } from "../../scripts/utils";
import debugLib from "debug";

const debug = debugLib("notifier:cypress:task:resetdb");

export async function scaffoldDatabase(): Promise<null> {
  debug("resetting db...");
  await resetdb();
  debug("running migrations...");
  await runAllMigrations();
  return null;
}
