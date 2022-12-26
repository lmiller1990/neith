// @ts-check

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  return knex.schema.createTable("organizations", (table) => {
    table.increments("id");
    table.text("organization_name").notNullable().unique();
    table.text("organization_email").notNullable().unique();
    table.text("organization_password").notNullable();
  });
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  return knex.schema.dropTable("organizations");
}
