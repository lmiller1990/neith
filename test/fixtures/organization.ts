import type { Knex } from "knex";

export function createOrganization(client: Knex) {
  return client("organizations").insert({
    organization_name: "test_org",
    organization_email: "test@test.org",
    organization_password: "test_password",
  });
}
