import { Knex } from "knex";
import { DateTime } from "luxon";
import { describe, expect, it, test } from "vitest";
import {
  Comparator,
  getLatest,
  getLatestPrerelease,
  isoToUtc,
  notify,
  NotifyPayload,
  VersionHistory,
} from "../src/notify";

describe("getLatestPrerelease", () => {
  it("returns latest prerelease before a specified date", () => {
    const versions: VersionHistory[] = [
      {
        version: "1.0.0-alpha.0",
        published: "2022-12-16T15:00:00.000Z",
      },
      {
        version: "0.9.1",
        published: "2022-12-17T15:00:00.000Z",
      },
      {
        version: "1.9.1-alpha.2",
        published: "2022-12-20T15:00:00.000Z",
      },
      {
        version: "1.0.0",
        published: "2022-12-20T15:00:00.000Z",
      },
    ];

    const cutoff = "2022-12-17T18:00:00.000Z";

    const actual = getLatestPrerelease(versions, cutoff);

    expect(actual).toEqual(versions[0]);
  });
});

describe("getLatest", () => {
  it("returns latest major before a specified date", () => {
    const versions: VersionHistory[] = [
      {
        version: "1.0.0",
        published: "2022-12-16T15:00:00.000Z",
      },
      {
        version: "2.1.5",
        published: "2022-12-17T15:00:00.000Z",
      },
      {
        version: "3.0.1",
        published: "2022-12-20T15:00:00.000Z",
      },
    ];

    const cutoff = "2022-12-18T15:00:00.000Z";

    const actual = getLatest(versions, cutoff);

    expect(actual).toEqual(versions[1]);
  });
});

describe("notify", () => {
  describe("major release", () => {
    describe("weekly notification", () => {
      it("returns module with major release jump", () => {
        const payload: NotifyPayload = {
          modules: [
            {
              npmInfo: {
                name: "vite",
                time: {
                  "0.9.0": "2022-12-16T15:00:00.000Z",
                  "1.0.0": "2022-12-25T15:00:00.000Z",
                },
              },
              notifyWhen: "major",
            },
          ],
          jobLastRun: null,
          now: "2022-12-27T15:00:00.000Z",
          schedule: "weekly",
        };

        const result = notify(payload);

        expect(result).toEqual([
          {
            name: "vite",
            previousVersion: {
              version: "0.9.0",
              published: "2022-12-16T15:00:00.000Z",
            },
            currentVersion: {
              version: "1.0.0",
              published: "2022-12-25T15:00:00.000Z",
            },
          },
        ]);
      });

      it("returns nothing if no suitable change is found", () => {
        const payload: NotifyPayload = {
          modules: [
            {
              npmInfo: {
                name: "vite",
                time: {
                  "0.9.0": "2022-12-16T15:00:00.000Z",
                  "0.10.0": "2022-12-25T15:00:00.000Z",
                },
              },
              notifyWhen: "major",
            },
          ],
          jobLastRun: null,
          now: "2022-12-27T15:00:00.000Z",
          schedule: "weekly",
        };

        const result = notify(payload);

        expect(result).toEqual([]);
      });
    });

    describe("daily notification", () => {
      it("returns module with major release jump", () => {
        const payload: NotifyPayload = {
          modules: [
            {
              npmInfo: {
                name: "vite",
                time: {
                  "0.8.0": "2022-12-16T15:00:00.000Z",
                  "0.9.0": "2022-12-24T15:00:00.000Z",
                  "1.0.0": "2022-12-25T15:00:00.000Z",
                },
              },
              notifyWhen: "major",
            },
          ],
          jobLastRun: null,
          now: "2022-12-26T15:00:00.000Z",
          schedule: "daily",
        };

        const result = notify(payload);

        expect(result).toEqual([
          {
            name: "vite",
            previousVersion: {
              version: "0.9.0",
              published: "2022-12-24T15:00:00.000Z",
            },
            currentVersion: {
              version: "1.0.0",
              published: "2022-12-25T15:00:00.000Z",
            },
          },
        ]);
      });
    });
  });

  describe("minor release", () => {
    it("returns when minor version jump occurs", () => {
      const payload: NotifyPayload = {
        modules: [
          {
            npmInfo: {
              name: "vite",
              time: {
                "0.8.0": "2022-12-16T15:00:00.000Z",
                "0.9.0": "2022-12-24T15:00:00.000Z",
                "0.10.0": "2022-12-25T15:00:00.000Z",
              },
            },
            notifyWhen: "minor",
          },
        ],
        jobLastRun: null,
        now: "2022-12-26T15:00:00.000Z",
        schedule: "daily",
      };

      const result = notify(payload);

      expect(result).toEqual([
        {
          name: "vite",
          previousVersion: {
            version: "0.9.0",
            published: "2022-12-24T15:00:00.000Z",
          },
          currentVersion: {
            version: "0.10.0",
            published: "2022-12-25T15:00:00.000Z",
          },
        },
      ]);
    });

    // If the user wants minor notifications but a major occurs
    // we also notify them. When the user opts for "minor" it really
    // means "minor AND above"
    it("returns when major version jump occurs", () => {
      const payload: NotifyPayload = {
        modules: [
          {
            npmInfo: {
              name: "vite",
              time: {
                "0.9.0": "2022-12-24T15:00:00.000Z",
                "1.0.0": "2022-12-25T15:00:00.000Z",
              },
            },
            notifyWhen: "minor",
          },
        ],
        jobLastRun: null,
        now: "2022-12-26T15:00:00.000Z",
        schedule: "daily",
      };

      const result = notify(payload);

      expect(result).toEqual([
        {
          name: "vite",
          previousVersion: {
            version: "0.9.0",
            published: "2022-12-24T15:00:00.000Z",
          },
          currentVersion: {
            version: "1.0.0",
            published: "2022-12-25T15:00:00.000Z",
          },
        },
      ]);
    });
  });
});
