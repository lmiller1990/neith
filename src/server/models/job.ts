import { Knex } from "knex";
import { schedule } from "../../../dbschema.js";
import debugLib from "debug";

const debug = debugLib("server:models:job");

export const Job = {
  async updateJobScheduleForOrganization(
    db: Knex,
    options: {
      jobSchedule: schedule;
      organizationId: number;
    }
  ): Promise<void> {
    const job = await db("jobs")
      .where({
        organization_id: options.organizationId,
      })
      .first();

    if (!job) {
      debug(`Did not find job for organization_id: %s`, options.organizationId);
      throw new Error(
        `Did not find job for organization_id: ${options.organizationId}`
      );
    }

    return db("jobs")
      .where({
        organization_id: options.organizationId,
      })
      .update({
        job_schedule: options.jobSchedule,
      });
  },
};
