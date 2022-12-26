import knex from "knex";
import { execa } from "../../scripts/utils";
import { it } from "vitest";
import knexConfig from "../../knexfile.js";

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
