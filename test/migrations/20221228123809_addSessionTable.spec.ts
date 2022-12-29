import { expect } from "vitest";
import { testMigration } from "./utils";

testMigration("20221228123809_addSessionTable", (verify) => {
  verify.up(async (client) => {
    const [{ id: orgId }] = await client("organizations")
      .insert({
        organization_name: "test_org",
        organization_email: "test@test.org",
        organization_password: "test_password",
      })
      .returning("id");

    await client("sessions")
      .insert({
        id: "aaa-bbb",

        created: "2022-12-28T12:42:58.499Z",
        organization_id: orgId,
      })
      .returning("id");

    const result = await client("sessions").first();

    expect(result).toEqual({
      created: new Date("2022-12-28T12:42:58.499Z"),
      id: "aaa-bbb",
      organization_id: orgId,
    });
  });

  verify.down(async (client) => {
    expect.assertions(1);

    try {
      await client("sessions").count({ count: "*" });
    } catch (e) {
      expect(e.message).toContain(`relation "sessions" does not exist`);
    }
  });
});
