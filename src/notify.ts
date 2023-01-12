import type { ModuleInfo } from "./types";
import { notify_when, schedule } from "../dbschema.js";
import { DateTime } from "luxon";
import semver from "semver";

export interface NotifyModule {
  npmInfo: Pick<ModuleInfo, "name" | "time">;
  notifyWhen: notify_when;
}

export interface NotifyPayload {
  modules: NotifyModule[];
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

  if (!diff) {
    return false;
  }

  switch (notifyWhen) {
    case "major": {
      return diff === "major";
    }

    case "minor": {
      return ["major", "minor"].includes(diff);
    }

    case "prerelease": {
      const diffs: semver.ReleaseType[] = [
        "premajor",
        "prerelease"
      ]
      return diffs.includes(diff)
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
    const previousMajor = getLatest(versions, notifyWindow);
    const currentMajor = getLatest(versions, payload.now);

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

export function getLatest(
  versions: VersionHistory[],
  cutoff: string
): VersionHistory {
  const comparator = makeComparator(cutoff);

  let best: VersionHistory = versions[0];
  for (const version of versions) {
    if (
      comparator(best, version) &&
      semver.compare(version.version, best.version) === 1
    ) {
      best = version;
    }
  }

  return best;
}
