import { expect } from "vitest";
import { createOrganization } from "../fixtures/organization";
import { testMigration } from "./utils";

testMigration("20230103105914_addTimezoneToJob", (verify) => {
  verify.up(async (client) => {
    const [{ id: orgId }] = await createOrganization(client).returning("id");

    await client("jobs").insert({
      organization_id: orgId,
      job_name: "test job",
      job_description: "this is a test job",
      job_starts_at: "2021-01-07T12:30:00.000Z",
      timezone: "Australia/Brisbane",
      job_schedule: "daily",
    });

    const [result] = await client("jobs")
      .where({
        timezone: "Australia/Brisbane",
      })
      .count("*");

    expect(result).toEqual({ count: "1" });
  });

  verify.down(async (client) => {
    try {
      await client("jobs").select("timezone");
    } catch (e: any) {
      expect(e.message).toContain(
        'select "timezone" from "jobs" - column "timezone" does not exist'
      );
    }
  });
});
