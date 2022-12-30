import { exec } from "node:child_process";
import knex from "knex";
import knexConfig from "../knexfile.js";
import debugLib from "debug";

const debug = debugLib("notifier:scripts:utils");

export async function execa(cmd: string) {
  debug('running cmd %s', cmd)
  return new Promise<string>((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) {
        debug('error running %s: %s', cmd, err.message)
        reject(err);
      }
      resolve(stdout);
    });
  });
}

const TEST_DB = "notifier_test";

export async function resetdb() {
  try {
    await execa(`dropdb ${TEST_DB}`);
  } catch (e) {
    //
  }
  await execa(`createdb ${TEST_DB}`);
}

export function createKnex() {
  return knex({
    ...knexConfig,
    connection: { ...knexConfig.connection, database: TEST_DB },
  });
}

export async function runAllMigrations() {
  await execa(`npm run db:migrate`);
}
