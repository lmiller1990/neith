import { Knex } from "knex";
import { beforeEach, describe, expect, it, test } from "vitest";
import { notify, NotifyPayload } from "../src/notify";
import { createKnex, resetdb, runAllMigrations } from "./migrations/utils";

async function createOrg(client: Knex) {
  const [{ id }] = await client("organizations")
    .insert({
      name: "test_org",
      email: "test@test.org",
      password: "test_password",
    })
    .returning("id");

  return client("organizations").where({ id }).first();
}

describe("notify", () => {
  test("weekly notification for major release", async () => {
    const payload: NotifyPayload = {
      modules: [
        {
          npmInfo: {
            name: "vite",
            time: {
              "0.9.0": "2022-12-16T15:00:00.000Z",
              "1.0.0": "2022-12-27T15:00:00.000Z",
            },
          },
          notifyWhen: "major",
        },
      ],
      jobLastRun: null,
      now: "2022-12-25T15:00:00.000Z",
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
          published: "2022-12-27T15:00:00.000Z",
        },
      },
    ]);
  });

  test("daily notification for major release", async () => {
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
