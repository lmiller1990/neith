import { DateTime } from "luxon";
import { schedule } from "../../../dbschema.js";
import debugLib from "debug";
import { sendEmail } from "./mailer.js";

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

export function scheduleJobs(jobs: JobToRun[]) {
  for (const job of jobs) {
    scheduler.schedule(job);
  }

  return scheduler;
}

export function startScheduler() {
  debug("Starting scheduler...");

  const scheduler = scheduleJobs([
    {
      runInMillis: millisUntilNextDesginatedHour(
        DateTime.now(),
        "Australia/Brisbane",
        19
      ),
      organizationId: 1,
      callback: async () => {
        console.log("Running job!");
        await sendEmail("");
        return Promise.resolve();
      },
      recurring: {
        calculateNextExecutionMillis: () => 1000 * 60 * 30,
      },
    },
  ]);

  return scheduler;
}
