import { expect } from "vitest";
import { createOrganization } from "../fixtures/organization";
import { testMigration } from "./utils";

testMigration("20230105104854_addSlackColumnsToOrganizationTable", (verify) => {
  verify.up(async (client) => {
    await createOrganization(client);
    await client("organizations").where({ id: 1 }).update({
      slack_workspace: "workspace",
      slack_channel: "dev",
    });

    const result = await client("organizations").where({
      id: 1,
    });

    expect(result).toEqual([
      {
        id: 1,
        organization_name: "test_org",
        organization_email: "test@test.org",
        organization_password: "test_password",
        slack_workspace: "workspace",
        slack_channel: "dev",
      },
    ]);
  });

  verify.down(async (client) => {
    try {
      await client("organizations").select(["slack_workspace"]);
    } catch (e: any) {
      expect(e.message).toContain(
        'select "slack_workspace" from "organizations" - column "slack_workspace" does not exist'
      );
    }

    try {
      await client("organizations").select(["slack_channel"]);
    } catch (e: any) {
      expect(e.message).toContain(
        'select "slack_channel" from "organizations" - column "slack_channel" does not exist'
      );
    }
  });
});
