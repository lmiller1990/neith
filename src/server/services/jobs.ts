import { Knex } from "knex";
import { EventEmitter } from "node:events";
import TypedEmitter from "typed-emitter";
import { DateTime } from "luxon";
import { schedule } from "../../../dbschema.js";

//  * In addition, see if any jobs that should have been run were **not** run,
//  *eg due to downtime, and run those.
//  *

/**
 * Get a list of all jobs and the next scheduled date.
 */

export interface Job {
  name: string;
  organizationId: number;
  schedule: schedule;
  timezone: string;
  callback : () => Promise<any>
  doneCallback?: () => void
}

export function millisUntilNextMonday(
  serverTimeNow: DateTime,
  timezone: string
) {
  const monday = 1;
  let d = serverTimeNow.setZone(timezone);
  while (d.weekday !== monday) {
    d = d.plus({ day: 1 }).set({
      hour: 9,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
  }

  return d.diff(serverTimeNow, "milliseconds").toMillis();
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

  callback: () => Promise<any>

  doneCallback?: () => void
}

export function deriveJobs(
  now: DateTime,
  jobs: Job[]
): JobToRun[] {
  return jobs.map((job) => {
    const runInMillis = millisUntilNextMonday(now, job.timezone);
    return {
      ...job,
      runInMillis,
    };
  });
}

// type EmitterEvents = {
//   "job:add": () => void;
// };

// / extends (EventEmitter as new () => TypedEmitter<EmitterEvents>) {
class Scheduler {
  #jobs = new Map<number, NodeJS.Timeout>();

  schedule(
    id: number,
    runInMillis: number,
    job: () => Promise<void>,
    doneCallback?: () => void
  ) {
    const timeoutID = global.setTimeout(async () => {
      await job();
      doneCallback?.();
    }, runInMillis);

    this.#jobs.set(id, timeoutID);
  }
}

const scheduler = new Scheduler();

export function scheduleJobs(jobs: JobToRun[]) {
  for (const job of jobs) {
    scheduler.schedule(
      job.organizationId,
      job.runInMillis,
      job.callback,
      job.doneCallback
    );

    return scheduler
  }
}
