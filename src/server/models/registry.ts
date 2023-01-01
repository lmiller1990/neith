import fetch from "node-fetch";
import { isoToUtc } from "../../notify.js";
import type { ModuleInfo } from "../../types.js";

const NPM = "https://registry.npmjs.org";

export const Registry = {
  async fetchPackage(pkg: string) {
    const res = await fetch(`${NPM}/${pkg}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = (await res.json()) as unknown as ModuleInfo;

    const tags = Object.entries(result["dist-tags"])
      .map(([name, tag]) => ({
        name,
        tag,
        published: result.time[tag],
      }))
      .map((x) => x)
      .sort((x, y) => (isoToUtc(x.published) < isoToUtc(y.published) ? 1 : -1));

    return {
      name: result.name,
      description: result.description,
      tags,
    };
  },
};
