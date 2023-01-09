import { describe, it, expect, beforeEach } from "vitest";
import {
  createKnex,
  resetdb,
  runAllMigrations,
} from "../../../scripts/utils.js";
import { Organization } from "../../../src/server/models/organization.js";
import { createJob } from "../../fixtures/job.js";
import { createOrganization } from "../../fixtures/organization.js";

describe("Organization", () => {
  beforeEach(async () => {
    await resetdb();
    await runAllMigrations();
  });

  describe("getAllWithJobs", () => {
    it("returns all orgs with associated jobs", async () => {
      const db = createKnex();
      await createOrganization(db);
      await createJob(db, { organization_id: 1 });

      const actual = await Organization.getAllWithJobs(db);

      expect(actual).toMatchInlineSnapshot(`
        [
          {
            "id": 1,
            "job_description": "Default job for for organization 1",
            "job_last_run": null,
            "job_name": "default_job",
            "job_schedule": "weekly",
            "job_starts_at": null,
            "organization_email": "test@test.org",
            "organization_id": 1,
            "organization_name": "test_org",
            "organization_password": "test_password",
            "slack_channel": null,
            "slack_workspace": null,
            "timezone": "Australia/Brisbane",
          },
        ]
      `);
    });
  });
});
