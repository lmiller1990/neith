import { expect } from "vitest";
import { testMigration } from "./utils";

testMigration("20221224052443_addJobTable", (verify) => {
  verify.up(async (client) => {
    const [{ id: orgId }] = await client("organizations")
      .insert({
        name: "test_org",
        email: "test@test.org",
        password: "test_password",
      })
      .returning("id");

    await client("jobs").insert({
      organization_id: orgId,
      name: "test job",
      description: "this is a test job",
      starts_at: "2021-01-07T12:30:00.000Z",
      schedule: "daily",
    });

    const result = await client("jobs").first();

    expect(result).toMatchInlineSnapshot(`
      {
        "description": "this is a test job",
        "id": 1,
        "name": "test job",
        "organization_id": 1,
        "schedule": "daily",
        "starts_at": 2021-01-07T12:30:00.000Z,
      }
    `);
  });

  verify.down(async (client) => {
    expect.assertions(2);

    try {
      await client("jobs").count({ count: "*" });
    } catch (e) {
      expect(e.message).toContain(`relation "jobs" does not exist`);
    }

    try {
      await client.raw(`select enum_range(null::schedule);`)
    } catch (e) {
      expect(e.message).toContain(`type "schedule" does not exist`);
    }
  });
});
