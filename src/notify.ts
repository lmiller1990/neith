import { ModuleInfo } from "./types";
import { notify_when, schedule } from "../dbschema.js";
import { DateTime } from "luxon";
import semver from "semver";

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

function getPrevDateTime(schedule: schedule, now: string): string {
  const prev = DateTime.fromISO(now, { zone: "utc" });

  if (!prev.isValid) {
    throw Error(`Could not parse datetime: ${prev.invalidReason}`);
  }

  if (schedule === "daily") {
    return prev.minus({ days: 1 }).toISO();
  }

  if (schedule === "weekly") {
    return prev.minus({ weeks: 1 }).toISO();
  }

  throw Error(`Expected schedule to be daily or weekly, got ${schedule}`);
}

export function shouldNotify(
  notifyWhen: notify_when,
  previousMajor: string,
  currentMajor: string
): boolean {
  const diff = semver.diff(previousMajor, currentMajor);

  switch (notifyWhen) {
    case "major": {
      return diff === "major";
    }

    case "minor": {
      return ["major", "minor"].includes(diff);
    }

    default: {
      throw Error(`${notifyWhen} is not implemented!`);
    }
  }
}

/**
 * The notify job fetches the latest version for each module the organization is subscribed to.
 * We see if any new version was released, and if it matches the version change the org is subscribed to.
 * If it does, we want to notify the user via their preferred method.
 */
export function notify(payload: NotifyPayload): NotifyModuleResult[] {
  let modules: NotifyModuleResult[] = [];

  for (const mod of payload.modules) {
    const versions = Object.entries(mod.npmInfo.time).map<VersionHistory>(
      (x) => {
        return {
          version: x[0],
          published: x[1],
        };
      }
    );

    const notifyWindow = getPrevDateTime(payload.schedule, payload.now);
    const previousMajor = getLatestMajor(versions, notifyWindow);
    const currentMajor = getLatestMajor(versions, payload.now);

    // console.log({ previousMajor, currentMajor });

    if (
      shouldNotify(mod.notifyWhen, previousMajor.version, currentMajor.version)
    ) {
      modules.push({
        name: mod.npmInfo.name,
        previousVersion: previousMajor,
        currentVersion: currentMajor,
      });
    }
  }

  return modules;
}

// export function notify(payload: NotifyPayload): NotifyModuleResult[] {
//   return payload.modules.reduce<NotifyModuleResult[]>((acc, mod) => {
//     const notifyWindow = getPrevDateTime(mod, payload.schedule, payload.now);

//     interface PublishedVersion {
//       published: DateTime;
//       version: string;
//     }

//     interface VersionResult {
//       latest: PublishedVersion;
//       previous: PublishedVersion;
//     }

//     const entries = Object.entries(mod.npmInfo.time) as Array<[string, string]>;

//     const init: PublishedVersion = {
//       version: entries[0][0],
//       published: DateTime.fromISO(entries[0][1], { zone: "utc" }),
//     };

//     const mostRecentBeforePeriod = entries.reduce<VersionResult>(
//       (acc, curr) => {
//         const currentDt = DateTime.fromISO(curr[1], { zone: "utc" });

//         // we want the most recent version outside the specified notification window.
//         // is the current datetime outside the notifcation window
//         // eg if the interval is weekly, we want the latest version
//         // published **prior** to the last week
//         const isOutsideNotifyWindow = currentDt < notifyWindow;

//         // check if it is more recent than the previous candidate
//         const moreRecentThanCurrentCandidate =
//           currentDt > acc.previous.published;

//         if (isOutsideNotifyWindow && moreRecentThanCurrentCandidate) {
//           acc.previous = {
//             published: currentDt,
//             version: curr[0],
//           };
//         }

//         // We also want the most recently published version to notify the user.
//         if (currentDt >= acc.latest.published) {
//           acc.latest = {
//             version: curr[0],
//             published: currentDt,
//           };
//         }

//         return acc;
//       },
//       {
//         latest: init,
//         previous: init,
//       }
//     );

//     if (
//       mod.notifyWhen === "major" &&
//       semver.diff(
//         mostRecentBeforePeriod.previous.version,
//         mostRecentBeforePeriod.latest.version
//       ) !== "major"
//     ) {
//       return acc
//     }

//     return acc.concat({
//       name: mod.npmInfo.name,
//       previousVersion: {
//         version: mostRecentBeforePeriod.previous.version,
//         published: mostRecentBeforePeriod.previous.published.toISO(),
//       },
//       currentVersion: {
//         version: mostRecentBeforePeriod.latest.version,
//         published: mostRecentBeforePeriod.latest.published.toISO(),
//       },
//     });
//   }, []);
// }

export interface VersionHistory {
  version: string;
  published: string;
}

export type Comparator = (
  current: VersionHistory,
  candidate: VersionHistory
) => boolean;

export function isoToUtc(iso: string) {
  const dt = DateTime.fromISO(iso, { zone: "utc" });
  if (!dt.isValid) {
    throw Error("Invalid datetime!");
  }
  return dt;
}

function makeComparator(cutoff: string): Comparator {
  return (v1, v2) => {
    const dt1 = isoToUtc(v1.published);
    const dt2 = isoToUtc(v2.published);

    return dt2 > dt1 && dt2 < isoToUtc(cutoff);
  };
}

export function getLatestPrerelease(
  versions: VersionHistory[],
  cutoff: string
): VersionHistory {
  const comparator = makeComparator(cutoff);

  let best: VersionHistory = versions[0];
  for (const version of versions) {
    const isPrerelease = Boolean(semver.prerelease(version.version));

    if (comparator(best, version) && isPrerelease) {
      best = version;
    }
  }

  return best;
}

export function getLatestMajor(
  versions: VersionHistory[],
  cutoff: string
): VersionHistory {
  const comparator = makeComparator(cutoff);

  let best: VersionHistory = versions[0];
  for (const version of versions) {
    if (
      comparator(best, version) &&
      semver.major(version.version) >= semver.major(best.version)
    ) {
      best = version;
    }
  }

  return best;
}

export function notifableVersionChange(
  v1: string,
  v2: string,
  notifyWhen: notify_when
): boolean {
  //
  return false;
}

// notify(, createKnex("notifier_test"))
