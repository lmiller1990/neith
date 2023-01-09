import type { Knex } from "knex";

export function createJob(client: Knex, options: { organization_id: number }) {
  return client("jobs").insert({
    job_description: `Default job for for organization ${options.organization_id}`,
    job_last_run: null,
    job_name: "default_job",
    job_schedule: "weekly",
    job_starts_at: null,
    organization_id: options.organization_id,
    timezone: "Australia/Brisbane",
  });
}
