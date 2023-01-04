import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import {
  deriveJobs,
  Job,
  millisUntilNextMonday,
  scheduleJobs,
} from "../../../src/server/services/jobs.js";

describe("deriveJobs", () => {
  it("handles weekly job", () => {
    let i = 0;
    const inc = () => Promise.resolve(i++);
    const jobs: Job[] = [
      {
        name: "job_one",
        organizationId: 1,
        timezone: "utc",
        schedule: "weekly",
        callback: inc,
      },
    ];

    // 7th of Jan 2023 is a Saturday.
    const now = DateTime.fromObject(
      {
        year: 2023,
        month: 1,
        day: 7,
        hour: 9,
        minute: 0,
        second: 0,
        millisecond: 0,
      },
      { zone: "utc" }
    );

    const actual = deriveJobs(now, jobs);

    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "callback": [Function],
          "name": "job_one",
          "organizationId": 1,
          "runInMillis": 172800000,
          "schedule": "weekly",
          "timezone": "utc",
        },
      ]
    `);
  });
});

describe("millisUntilNextMonday", () => {
  it("works when now is in previous week", () => {
    // 8th of Jan 2023 is a Sunday.
    const now = DateTime.fromObject(
      {
        year: 2023,
        month: 1,
        day: 8,
        hour: 9,
        minute: 0,
        second: 0,
        millisecond: 0,
      },
      { zone: "utc" }
    );

    const actual = millisUntilNextMonday(now, "utc");

    // 24 hours
    expect(actual).toBe(86400000);
  });

  it("works when now is in previous week", () => {
    // 8th of Jan 2023 is a Sunday.
    const now = DateTime.fromObject(
      {
        year: 2023,
        month: 1,
        day: 8,
        hour: 9,
        minute: 0,
        second: 0,
        millisecond: 0,
      },
      { zone: "America/New_York" }
    );

    const actual = millisUntilNextMonday(now, "America/New_York");

    // 24 hours
    expect(actual).toBe(86400000);
  });

  it("gets correct value when comparing utc and specific timezone", () => {
    // 8th of Jan 2023 is a Sunday.
    const now = DateTime.fromObject(
      {
        year: 2023,
        month: 1,
        day: 8,
        hour: 9,
        minute: 0,
        second: 0,
        millisecond: 0,
      },
      { zone: "utc" }
    );

    const actual = millisUntilNextMonday(now, "America/New_York");

    // 29h => 104400000ms
    expect(actual).toBe(104400000);
  });
});

describe("scheduleJobs", () => {
  it.only("schedules and runs job", () =>
    new Promise<void>((done) => {
      let i = 0;
      const inc = () => Promise.resolve(i++);

      let complete = false;
      const doneCallback = () => (complete = true);

      const scheduler = scheduleJobs([
        {
          runInMillis: 1000,
          organizationId: 1,
          callback: inc,
          doneCallback,
        },
      ]);

      global.setTimeout(() => {
        expect(complete).toBe(true)
        expect(i).toBe(1)
        // does not reschedule
        expect(Array.from(scheduler.jobs.keys()).length).toBe(0)
        done()
      }, 1500)
    }));

  it("reschedules job", () =>
    new Promise<void>((done) => {
      let i = 0;
      const inc = () => {
        i++
        return Promise.resolve(i === 1 ? true : false)
      };

      const scheduler = scheduleJobs([
        {
          runInMillis: 500,
          organizationId: 1,
          callback: inc,
          recurring: {
            calculateNextExecutionMillis: () => 500,
          },
        },
      ]);

      global.setTimeout(() => {
        expect(i).toBe(1)
      }, 700)

      global.setTimeout(() => {
        expect(i).toBe(2)
        console.log(scheduler.jobs)
        expect(scheduler.jobs).toMatchInlineSnapshot('Map {}')
        done()
      }, 1200)
    }));
});
