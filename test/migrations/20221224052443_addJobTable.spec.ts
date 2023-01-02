import { expect } from "vitest";
import { testMigration } from "./utils";

testMigration("20221224052443_addJobTable", (verify) => {
  verify.up(async (client) => {
    const [{ id: orgId }] = await client("organizations")
      .insert({
        organization_name: "test_org",
        organization_email: "test@test.org",
        organization_password: "test_password",
      })
      .returning("id");

    await client("jobs").insert({
      organization_id: orgId,
      job_name: "test job",
      job_description: "this is a test job",
      job_starts_at: "2021-01-07T12:30:00.000Z",
      job_schedule: "daily",
    });

    const result = await client("jobs").first();

    expect(result).toMatchInlineSnapshot(`
      {
        "id": 1,
        "job_description": "this is a test job",
        "job_last_run": null,
        "job_name": "test job",
        "job_schedule": "daily",
        "job_starts_at": 2021-01-07T12:30:00.000Z,
        "organization_id": 1,
      }
    `);
  });

  verify.down(async (client) => {
    expect.assertions(2);

    try {
      await client("jobs").count({ count: "*" });
    } catch (e: any) {
      expect(e.message).toContain(`relation "jobs" does not exist`);
    }

    try {
      await client.raw(`select enum_range(null::schedule);`);
    } catch (e: any) {
      expect(e.message).toContain(`type "schedule" does not exist`);
    }
  });
});
