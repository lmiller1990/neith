import { Knex } from "knex";
import { schedule } from "../../../dbschema.js";
import debugLib from "debug";
import { Organization } from "./organization.js";

const debug = debugLib("server:models:job");

export const Job = {
  async updateJobScheduleForOrganization(
    db: Knex,
    options: {
      jobSchedule: schedule;
      organizationId: number;
    }
  ): Promise<void> {
    const job = await Organization.getJob(db, {
      organizationId: options.organizationId,
    });

    return db("jobs")
      .where({
        id: job.id,
      })
      .update({
        job_schedule: options.jobSchedule,
      });
  },
};
