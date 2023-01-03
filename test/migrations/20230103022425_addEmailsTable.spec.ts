import { expect } from "vitest";
import { testMigration } from "./utils";

testMigration("20230103022425_addEmailsTable", (verify) => {
  verify.up(async (client) => {
    const [{ id: orgId }] = await client("organizations")
      .insert({
        organization_name: "test_org",
        organization_email: "test@test.org",
        organization_password: "test_password",
      })
      .returning("id");

    await client("emails").insert({
      email: "somebody@example.com",
      organization_id: orgId,
    });

    const result = await client("organizations")
      .join("emails", "organizations.id", "=", "emails.organization_id")
      .where("emails.organization_id", orgId);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "email": "somebody@example.com",
          "id": 1,
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
      await client("emails").count({ count: "*" });
    } catch (e: any) {
      expect(e.message).toContain(`relation "emails" does not exist`);
    }
  });
});
