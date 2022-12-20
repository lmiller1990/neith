import knex from "knex";
import { exec } from "node:child_process";
import { describe, it, beforeEach, expect } from "vitest";
import knexConfig from "../../knexfile.js";

const TEST_DB = "notifier_test";

async function execa(cmd: string) {
  await new Promise<void>((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

async function createdb() {
  try {
    console.log(`Dropping ${TEST_DB}...`);
    await execa(`dropdb ${TEST_DB}`);
    console.log(`Dropped db!`);
  } catch {
    //
  }

  console.log(`Creating ${TEST_DB}...`);
  await execa(`createdb ${TEST_DB}`);
  console.log(`Created db!`);
}

function createKnex() {
  return knex({
    ...knexConfig,
    connection: { ...knexConfig.connection, database: TEST_DB },
  });
}

describe("migrations", () => {
  beforeEach(async () => {
    await createdb();
    console.log("done");
  });

  it("addOrganizationTable", async () => {
    await execa(`npm run db:migrate`);
    const client = createKnex();
    await client("organizations").insert({
      name: "test_org",
      email: "test@test.org",
      password: "test_password",
    });

    const result = await client("organizations").where({
      name: "test_org",
    });

    expect(result).toEqual([
      {
        id: 1,
        name: "test_org",
        email: "test@test.org",
        password: "test_password",
      },
    ]);
  });
});
