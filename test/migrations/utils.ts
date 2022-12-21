import knex from "knex";
import { exec } from "node:child_process";
import { it } from "vitest";
import knexConfig from "../../knexfile.js";

const TEST_DB = "notifier_test";

export async function execa(cmd: string) {
  await new Promise<void>((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export async function resetdb() {
  try {
    console.log(`Dropping ${TEST_DB}`);
    await execa(`dropdb ${TEST_DB}`);
  } catch (e) {
    console.log("ERROR", e);
    //
  }
  console.log(`Creating ${TEST_DB}`);
  await execa(`createdb ${TEST_DB}`);
}

export function createKnex() {
  return knex({
    ...knexConfig,
    connection: { ...knexConfig.connection, database: TEST_DB },
  });
}

export type KnexClientCallback = (
  client: ReturnType<typeof knex>
) => Promise<void>;

export interface MigrationTest {
  up: (callback: KnexClientCallback) => any;
  down: (callback: KnexClientCallback) => any;
}

export async function testMigration(
  migration: string,
  migrationTest: (fns: MigrationTest) => void
) {
  function up(cb: KnexClientCallback) {
    it(`${migration} - up`, async () => {
      // destroy existing db and create new one
      await resetdb();

      // migration
      await execa(`npm run db:migrate ${migration}.js`);

      // run test
      const client = createKnex();
      await cb(client);

      // cleanup - close connection
      await client.destroy();
    });
  }

  function down(cb: KnexClientCallback) {
    it(`${migration} - down`, async () => {
      // destroy existing db and create new one
      await resetdb();

      // migration
      await execa(`npm run db:migrate ${migration}.js`);
      await execa(`npm run db:rollback ${migration}.js`);

      // run test
      const client = createKnex();
      await cb(client);

      // cleanup - close connection
      await client.destroy();
    });
  }

  migrationTest({ up, down });
}
