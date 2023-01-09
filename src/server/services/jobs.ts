import { DateTime } from "luxon";
import { schedule } from "../../../dbschema.js";
import { NotifyModule, NotifyPayload } from "../../notify.js";
import debugLib from "debug";
import { Mailer } from "./mailer.js";
import { Package } from "../models/package.js";
import { Knex } from "knex";
import { Organization } from "../models/organization.js";
import { Registry } from "../models/registry.js";

const debug = debugLib("server:services:jobs");

/**
 * Get a list of all jobs and the next scheduled date.
 */
export interface Job {
  name: string;
  organizationId: number;
  schedule: schedule;
  timezone: string;
  callback: () => Promise<any>;
  doneCallback?: () => void;
}

export function millisUntilNextDesginatedHour(
  now: DateTime,
  timezone: string,
  hour = 9
) {
  let d = now.setZone(timezone);

  if (d.hour === hour) {
    d = d.plus({ hour: 1 });
  }

  while (d.hour !== hour) {
    d = d.plus({ hour: 1 });
  }

  d = d.set({
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  return d.diff(now, "milliseconds").toMillis();
}
export function millisUntilNextMondayAtHours(
  now: DateTime,
  timezone: string,
  hours = 9
) {
  const monday = 1;
  let d = now.setZone(timezone);

  while (d.weekday !== monday) {
    d = d.plus({ day: 1 });
  }

  d = d.set({
    hour: hours,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  return d.diff(now, "milliseconds").toMillis();
}

interface JobToRun {
  /**
   * Number of milliseconds until this job should execute.
   */
  runInMillis: number;

  /**
   * Organization that job belongs to.
   */
  organizationId: number;

  /**
   * Function to execute when running job.
   *
   * If the callback resolves `false`, the job will not re-run,
   * even if `recurring` is provided.
   */
  callback: () => Promise<any>;

  /**
   * Optional callback, executed when the job has finished running.
   */
  doneCallback?: () => void;

  /**
   * A job can be recurring. If so, a function that calculates
   * when it should next run should be provided.
   * The function should return the number of milliseconds until
   * the next execution.
   */
  recurring?: {
    calculateNextExecutionMillis: () => number;
  };
}

export function deriveJobs(now: DateTime, jobs: Job[]): JobToRun[] {
  return jobs.map((job) => {
    const runInMillis = millisUntilNextMondayAtHours(now, job.timezone);
    return {
      ...job,
      runInMillis,
    };
  });
}

class Scheduler {
  #jobs = new Map<number, NodeJS.Timeout>();

  get jobs() {
    return this.#jobs;
  }

  schedule(jobToRun: JobToRun) {
    const timeoutID = global.setTimeout(async () => {
      const repeat = await jobToRun.callback();
      jobToRun.doneCallback?.();
      this.#jobs.delete(jobToRun.organizationId);
      if (repeat !== false && jobToRun.recurring) {
        this.schedule({
          ...jobToRun,
          runInMillis: jobToRun.recurring.calculateNextExecutionMillis(),
        });
      }
    }, jobToRun.runInMillis);

    this.#jobs.set(jobToRun.organizationId, timeoutID);
  }
}

const scheduler = new Scheduler();

export function scheduleJob(job: JobToRun) {
  scheduler.schedule(job);

  return scheduler;
}

interface OrganizationJob {
  db: Knex;
  timezone: string;
  organizationId: number;
  schedule: schedule;
}

const DESIGNATED_HOUR = 9;

export async function fetchOrganizationModules(
  db: Knex,
  options: { organizationId: number }
): Promise<NotifyModule[]> {
  const pkgs = await Package.getModulesForOrganization(db, options);

  const npmInfo = await Promise.all(
    pkgs.map(async (x) => {
      const info = await Registry.fetchFromRegistry(x.module_name);
      delete info.time['created']
      delete info.time['modified']
      return {
        npmInfo: info,
        name: x.module_name,
        notifyWhen: x.notify_when,
      };
    })
  );

  return npmInfo;
}

export async function startScheduler(db: Knex) {
  debug("Starting scheduler...");

  const jobs = await Organization.getAllWithJobs(db);

  debug("starting jobs %s", JSON.stringify(jobs, null, 2));

  for (const job of jobs) {
    scheduleJob({
      runInMillis: millisUntilNextDesginatedHour(
        DateTime.now(),
        job.timezone,
        DESIGNATED_HOUR
      ),
      organizationId: job.organization_id,
      callback: async () => {
        debug("Running job for organization_id: %s", job.organization_id);

        const payload: NotifyPayload = {
          modules: await fetchOrganizationModules(db, {
            organizationId: job.organization_id,
          }),
          schedule: job.job_schedule,
          now: DateTime.now().toISO(),
        };

        const emailData = Organization.notificationEmailContent(payload);
        await Mailer.sendEmail(emailData);
      },
      recurring: {
        calculateNextExecutionMillis: () => {
          if (job.job_schedule === "daily") {
            return millisUntilNextDesginatedHour(
              DateTime.now(),
              job.timezone,
              DESIGNATED_HOUR
            );
          }

          // must be weekly, the default
          return millisUntilNextMondayAtHours(
            DateTime.now(),
            job.timezone,
            DESIGNATED_HOUR
          );
        },
      },
    });
  }
}
