import { expect } from "vitest";
import { testMigration } from "./utils";

testMigration("20221223095059_addModuleTables", (verify) => {
  verify.up(async (client) => {
    const [{ id: orgId }] = await client("organizations")
      .insert({
        organization_name: "test_org",
        organization_email: "test@test.org",
        organization_password: "test_password",
      })
      .returning("id");

    await client("modules")
      .insert({
        module_name: "vite",
        organization_id: orgId,
        notify_when: "major",
      })
      .returning("id");

    const result = await client("organizations")
      .join("modules", "organizations.id", "=", "modules.organization_id")
      .where("organizations.id", orgId);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "id": 1,
          "module_name": "vite",
          "notify_when": "major",
          "organization_email": "test@test.org",
          "organization_id": 1,
          "organization_name": "test_org",
          "organization_password": "test_password",
        },
      ]
    `);
  });

  verify.down(async (client) => {
    expect.assertions(1);

    try {
      await client("modules").count({ count: "*" });
    } catch (e: any) {
      expect(e.message).toContain(`relation "modules" does not exist`);
    }
  });
});
