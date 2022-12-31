import knex from "knex";
import { createKnex, execa, resetdb } from "../../scripts/utils.js";
import { it } from "vitest";

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
