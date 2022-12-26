import { Context } from "../context";
import assert from "assert";
import type {
  Organizations,
  OrganizationModules,
  Modules,
  ModuleVersions,
} from "../../../dbschema.js";

export class OrganzationsActions {
  #ctx: Context;

  constructor(ctx: Context) {
    this.#ctx = ctx;
  }

  async queryModulesForOrganzations(orgId: number) {
    const res = (await this.#ctx
      .knex("organizations")
      .join(
        "organization_modules",
        "organization_modules.organization_id",
        "=",
        "organizations.id"
      )
      .join("modules", "organization_modules.module_id", "=", "modules.id")
      .join("module_versions", "modules.id", "=", "module_versions.module_id")
      .where("organizations.id", orgId)) as Array<
      Organizations & OrganizationModules & Modules & ModuleVersions
    >;

    return res.map((row) => {
      return {};
    });
  }
}
