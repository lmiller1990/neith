import { Knex } from "knex";
import { schedule } from "../../../dbschema.js";

//  * In addition, see if any jobs that should have been run were **not** run,
//  *eg due to downtime, and run those.
//  *

/**
 * Get a list of all jobs and the next scheduled date.
 */

interface Job {
  name: string;
  startsAt: string;
  lastRunAt: string;
  schedule: schedule;
}

interface DeriveJobsPayload {
  jobs: Job[];
}

export async function deriveJobs(db: Knex, payload: DeriveJobsPayload) {
  const jobs = await db("jobs");
  // ...
}
