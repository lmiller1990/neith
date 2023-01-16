import { DateTime } from "luxon";
import { Jobs, Organizations, schedule } from "../../../dbschema.js";
import type { NotifyModule, NotifyPayload } from "../../notify.js";
import debugLib from "debug";
import { Mailer } from "./mailer.js";
import { Package } from "../models/package.js";
import type { Knex } from "knex";
import { Organization } from "../models/organization.js";
import { Registry } from "../models/registry.js";
import { toHuman } from "../utils.js";

const debug = debugLib("neith:server:services:jobs");

const DESIGNATED_HOUR = 9;

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
  hour = DESIGNATED_HOUR
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
  hours = DESIGNATED_HOUR
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
  calcMillisUntilExecution: () => number;

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

export class Scheduler {
  #jobs = new Map<number, NodeJS.Timeout>();

  get jobs() {
    return this.#jobs;
  }

  clearSchedule(organizationId: number) {
    const id = this.#jobs.get(organizationId);
    if (!id) {
      debug(
        "tried clearing job with organization_id %s but one does not exist.",
        organizationId
      );
      return;
    }

    global.clearTimeout(id);
    this.#jobs.delete(organizationId);
  }

  schedule(jobToRun: JobToRun) {
    debug(
      "time is now %s. Scheduling job to run in %s ms. That is in %o",
      DateTime.now().toISO(),
      jobToRun.calcMillisUntilExecution(),
      toHuman(jobToRun.calcMillisUntilExecution())
    );

    const timeoutID = global.setTimeout(async () => {
      const repeat = await jobToRun.callback();
      jobToRun.doneCallback?.();

      this.#jobs.delete(jobToRun.organizationId);

      if (repeat !== false && jobToRun.recurring) {
        this.schedule({
          ...jobToRun,
          calcMillisUntilExecution:
            jobToRun.recurring.calculateNextExecutionMillis,
        });
      }
    }, jobToRun.calcMillisUntilExecution());

    this.#jobs.set(jobToRun.organizationId, timeoutID);
  }
}

const scheduler = new Scheduler();

function calculateNextExecution(timezone: string, schedule: schedule): number {
  if (schedule === "daily") {
    return millisUntilNextDesginatedHour(
      DateTime.now(),
      timezone,
      DESIGNATED_HOUR
    );
  }

  // must be weekly, the default
  return millisUntilNextMondayAtHours(
    DateTime.now(),
    timezone,
    DESIGNATED_HOUR
  );
}

export function scheduleJob(
  job: Organizations & Jobs,
  task: () => Promise<void>
) {
  const jobToRun: JobToRun = {
    calcMillisUntilExecution: () => {
      return calculateNextExecution(job.timezone, job.job_schedule);
    },

    organizationId: job.organization_id,

    callback: task,

    recurring: {
      calculateNextExecutionMillis: () => {
        return calculateNextExecution(job.timezone, job.job_schedule);
      },
    },
  };

  scheduler.schedule(jobToRun);

  return scheduler;
}

export async function fetchOrganizationModules(
  db: Knex,
  options: { organizationId: number }
): Promise<NotifyModule[]> {
  const pkgs = await Package.getModulesForOrganization(db, options);

  const npmInfo = await Promise.all(
    pkgs.map(async (x) => {
      const info = await Registry.fetchFromRegistry(x.module_name);
      delete info.time["created"];
      delete info.time["modified"];
      return {
        npmInfo: info,
        name: x.module_name,
        notifyWhen: x.notify_when,
      };
    })
  );

  return npmInfo;
}

async function sendMail(db: Knex, job: Jobs & Organizations) {
  debug("Sending mail for organization_id: %s", job.organization_id);

  const payload: NotifyPayload = {
    modules: await fetchOrganizationModules(db, {
      organizationId: job.organization_id,
    }),
    schedule: job.job_schedule,
    now: DateTime.now().toISO(),
  };

  const emailData = Organization.notificationEmailContent(payload);
  debug("Sending email: %s", emailData);
  await Mailer.sendEmail(emailData);
}

export async function rescheduleJob(db: Knex, organizationId: number) {
  const job = await Organization.getJobWithOrg(db, { organizationId });
  debug("rescheduling job %o", job);
  scheduler.clearSchedule(job.organization_id);

  scheduleJob(job, () => sendMail(db, job));
}

export async function startScheduler(db: Knex) {
  debug("Starting scheduler...");

  const jobs = await Organization.getAllWithJobs(db);

  debug("starting jobs %s", JSON.stringify(jobs, null, 2));

  for (const job of jobs) {
    scheduleJob(job, () => sendMail(db, job));
  }
}
