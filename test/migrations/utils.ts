import knex from "knex";
import path from "node:path";
import { createKnex, execa, resetdb } from "../../scripts/utils.js";
import { it } from "vitest";
import fs from "node:fs/promises";
import url from "node:url";
import debugLib from "debug";

const debug = debugLib("neith:test:migration:utils");

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export type KnexClientCallback = (
  client: ReturnType<typeof knex>
) => Promise<void>;

export interface MigrationTest {
  up: (callback: KnexClientCallback) => any;
  down: (callback: KnexClientCallback) => any;
}

async function migrationsToRun(migration: string) {
  const migrations = await fs.readdir(
    path.join(__dirname, "..", "..", "migrations")
  );
  const toRun: string[] = [];
  for (let i = 0; i < migrations.length; i++) {
    toRun.push(migrations[i]);
    if (migrations[i].includes(migration)) {
      return toRun;
    }
  }
  return toRun;
}

export async function testMigration(
  migration: string,
  migrationTest: (fns: MigrationTest) => void
) {
  function up(cb: KnexClientCallback) {
    it(`${migration} - up`, async () => {
      // destroy existing db and create new one
      const dbname = await resetdb();

      const migrations = await migrationsToRun(migration);
      debug("migrations to run %o", migrations);

      // migration
      for (const toRun of migrations) {
        debug("running %s", toRun);
        await execa(`npm run db:test:migrate:up ${toRun}`, {
          POSTGRES_DB: dbname,
        });
      }

      const client = createKnex(dbname);

      try {
        await cb(client);
      } catch (e) {
        throw e;
      } finally {
        // cleanup - close connection
        await client.destroy();

        try {
          debug(`Dropping ${dbname}`);
          await execa(`dropdb ${dbname}`);
        } catch (e) {
          console.error(`Failed to dropdb ${dbname}`, e);
        }
      }
    });
  }

  function down(cb: KnexClientCallback) {
    it(`${migration} - down`, async () => {
      // destroy existing db and create new one
      const dbname = await resetdb();

      const migrations = await migrationsToRun(migration);

      // migration
      for (const toRun of migrations) {
        debug("running %s", toRun);
        await execa(`npm run db:test:migrate:up ${toRun}`, {
          POSTGRES_DB: dbname,
        });
      }

      await execa(`npm run db:test:migrate:down`, {
        POSTGRES_DB: dbname,
      });

      // run test
      const client = createKnex(dbname);
      try {
        await cb(client);
      } catch (e) {
        throw e;
      } finally {
        // cleanup - close connection
        await client.destroy();

        try {
          debug(`Dropping ${dbname}`);
          await execa(`dropdb ${dbname}`);
        } catch (e) {
          console.error(`Failed to dropdb ${dbname}`, e);
        }
      }
    });
  }

  migrationTest({ up, down });
}
