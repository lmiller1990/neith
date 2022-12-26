import { ModuleInfo } from "./types";
import { notify_when, schedule } from "../dbschema.js";
import { DateTime } from "luxon";

interface NotifyModule {
  npmInfo: Pick<ModuleInfo, "name" | "time">;
  notifyWhen: notify_when;
}

export interface NotifyPayload {
  modules: NotifyModule[];
  jobLastRun?: string;
  schedule: schedule;
  now: string;
}

interface ModuleVersion {
  published: string;
  version: string;
}

interface NotifyModuleResult {
  name: string;
  previousVersion: ModuleVersion;
  currentVersion: ModuleVersion;
}

function getPrevDateTime(mod: NotifyModule, schedule: schedule, now: string) {
  const prev = DateTime.fromISO(now, { zone: "utc" });

  if (!prev.isValid) {
    throw Error(`Could not parse datetime: ${prev.invalidReason}`);
  }

  if (schedule === "daily") {
    return prev.minus({ days: 1 });
  }

  if (schedule === "weekly") {
    return prev.minus({ weeks: 1 });
  }

  throw Error(`Expected schedule to be daily or weekly, got ${schedule}`);
}

/**
 * The notify job fetches the latest version for each module the organization is subscribed to.
 * We see if any new version was released, and if it matches the version change the org is subscribed to.
 * If it does, we want to notify the user via their preferred method.
 */
export function notify(payload: NotifyPayload): NotifyModuleResult[] {
  return payload.modules.map((mod) => {
    const notifyWindow = getPrevDateTime(mod, payload.schedule, payload.now);

    interface PublishedVersion {
      published: DateTime;
      version: string;
    }

    interface VersionResult {
      latest: PublishedVersion;
      previous: PublishedVersion;
    }

    const entries = Object.entries(mod.npmInfo.time);
    const init: PublishedVersion = {
      version: entries[0][0],
      published: DateTime.fromISO(entries[0][1], { zone: "utc" }),
    };

    const mostRecentBeforePeriod = entries.reduce<VersionResult>(
      (acc, curr) => {
        const currentDt = DateTime.fromISO(curr[1], { zone: "utc" });

        // we want the most recent version outside the specified notification window.
        // is the current datetime outside the notifcation window
        // eg if the interval is weekly, we want the latest version
        // published **prior** to the last week
        const isOutsideNotifyWindow = currentDt < notifyWindow;

        // check if it is more recent than the previous candidate
        const moreRecentThanCurrentCandidate =
          currentDt > acc.previous.published;

        if (isOutsideNotifyWindow && moreRecentThanCurrentCandidate) {
          acc.previous = {
            published: currentDt,
            version: curr[0],
          };
        }

        // We also want the most recently published version to notify the user.
        if (currentDt >= acc.latest.published) {
          acc.latest = {
            version: curr[0],
            published: currentDt,
          };
        }

        return acc;
      },
      {
        latest: init,
        previous: init,
      }
    );

    return {
      name: mod.npmInfo.name,
      previousVersion: {
        version: mostRecentBeforePeriod.previous.version,
        published: mostRecentBeforePeriod.previous.published.toISO(),
      },
      currentVersion: {
        version: mostRecentBeforePeriod.latest.version,
        published: mostRecentBeforePeriod.latest.published.toISO(),
      },
    };
  });
}

// notify(, createKnex("notifier_test"))
