import { describe, it, expect, beforeEach } from "vitest";
import {
  createKnex,
  resetdb,
  runAllMigrations,
} from "../../../scripts/utils.js";
import { Package } from "../../../src/server/models/package.js";
import { createOrganization } from "../../fixtures/organization.js";

describe("saveModuleForOrganization", () => {
  let dbname: string;
  beforeEach(async () => {
    dbname = await resetdb();
    await runAllMigrations(dbname);
  });

  it("saves a new package", async () => {
    const client = createKnex(dbname);
    const [{ id }] = await createOrganization(client).returning(["id"]);

    await Package.saveModuleForOrganization(client, {
      name: "vite",
      notify: "major",
      organizationId: id,
    });

    const actual = await client("modules")
      .where({
        organization_id: id,
      })
      .first();

    expect(actual).toEqual({
      id: 1,
      organization_id: 1,
      module_name: "vite",
      notify_when: "major",
    });

    await Package.saveModuleForOrganization(client, {
      name: "vite",
      notify: "minor",
      organizationId: id,
    });

    const updated = await client("modules")
      .where({
        organization_id: id,
      })
      .first();

    expect(updated).toEqual({
      id: 1,
      organization_id: 1,
      module_name: "vite",
      notify_when: "minor",
    });
  });
});
