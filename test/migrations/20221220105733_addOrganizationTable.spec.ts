import { expect } from "vitest";
import { testMigration } from "./utils";

testMigration("20221220105733_addOrganizationTable", (verify) => {
  verify.up(async (client) => {
    await client("organizations").insert({
      organization_name: "test_org",
      organization_email: "test@test.org",
      organization_password: "test_password",
    });

    const result = await client("organizations").where({
      organization_name: "test_org",
    });

    expect(result).toEqual([
      {
        id: 1,
        organization_name: "test_org",
        organization_email: "test@test.org",
        organization_password: "test_password",
      },
    ]);
  });

  verify.down(async (client) => {
    try {
      await client("organizations").count({ count: "*" });
    } catch (e) {
      expect(e.message).toContain('relation "organizations" does not exist');
    }
  });
});
