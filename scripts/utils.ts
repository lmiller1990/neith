import { exec } from "node:child_process";
import knex from "knex";
import knexConfig from "../knexfile.js";
import debugLib from "debug";

const debug = debugLib("neith:scripts:utils");

export async function execa(cmd: string, env: Record<string, string> = {}) {
  debug("running cmd %s", cmd);
  return new Promise<string>((resolve, reject) => {
    exec(
      cmd,
      {
        env: { ...process.env, ...env },
      },
      (err, stdout) => {
        if (err) {
          debug("error running %s: %s", cmd, err.message);
          reject(err);
        }
        resolve(stdout);
      }
    );
  });
}

const TEST_DB = "notifier_test";

export async function resetdb() {
  const name = `${TEST_DB}_${(Math.random() * 10000).toFixed(0)}`;
  debug(`Creating db: ${name}`);
  await execa(`createdb ${name}`);

  return name;
}

export function createKnex(name: string) {
  return knex({
    ...knexConfig,
    connection: { ...knexConfig.connection, database: name },
  });
}

export async function runAllMigrations(dbname: string) {
  await execa(`npm run db:test:migrate:all`, {
    POSTGRES_DB: dbname,
  });
}
