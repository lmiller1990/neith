import { resetdb, runAllMigrations } from "../../scripts/utils.js";
import debugLib from "debug";

const debug = debugLib("neith:cypress:task:resetdb");

export async function scaffoldDatabase(): Promise<null> {
  debug("resetting db...");
  const dbname = await resetdb("notifier_test");
  debug("running migrations...");
  await runAllMigrations(dbname);
  return null;
}
