import fetch from "node-fetch";
import { isoToUtc } from "../../notify.js";
import type { ModuleInfo } from "../../types.js";

const NPM = "https://registry.npmjs.org";

export type GetDependency = Awaited<
  ReturnType<typeof Registry["fetchPackage"]>
>;

export interface NpmPkg {
  name: string;
  description: string;
  tags: Array<{
    name: string;
    tag: string;
    published: string;
  }>;
}

export const Registry = {
  async fetchFromRegistry(pkg: string) {
    const res = await fetch(`${NPM}/${pkg}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return (await res.json()) as unknown as ModuleInfo;
  },

  async fetchPackage(pkg: string): Promise<NpmPkg> {
    const result = await this.fetchFromRegistry(pkg);
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
