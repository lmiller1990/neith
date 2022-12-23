import { expect } from "vitest";
import { testMigration } from "./utils";

testMigration("20221223095059_addModuleTables", (verify) => {
  verify.up(async (client) => {
    const [{ id: orgId }] = await client("organizations")
      .insert({
        name: "test_org",
        email: "test@test.org",
        password: "test_password",
      })
      .returning("id");

    const [{ id: modId }] = await client("modules")
      .insert({
        name: "vite",
      })
      .returning("id");

    await client("module_versions").insert({
      version: "4.0.0-alpha.1",
      module_id: modId,
      published: "2021-01-07T12:30:00.000Z",
    });

    await client("organization_modules").insert({
      module_id: modId,
      organization_id: orgId,
    });

    const result = await client("organizations")
      .join(
        "organization_modules",
        "organization_modules.organization_id",
        "=",
        "organizations.id"
      )
      .join("modules", "organization_modules.module_id", "=", "modules.id")
      .join("module_versions", "modules.id", "=", "module_versions.module_id")
      .where("organizations.id", orgId);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "email": "test@test.org",
          "id": 1,
          "module_id": 1,
          "name": "vite",
          "organization_id": 1,
          "password": "test_password",
          "published": 2021-01-07T12:30:00.000Z,
          "version": "4.0.0-alpha.1",
        },
      ]
    `);
  });

  verify.down(async (client) => {
    expect.assertions(3)

    for (const table of [
      "organization_modules",
      "modules",
      "module_versions",
    ]) {
      try {
        await client(table).count({ count: "*" });
      } catch (e) {
        expect(e.message).toContain(`relation "${table}" does not exist`);
      }
    }
  });
});
