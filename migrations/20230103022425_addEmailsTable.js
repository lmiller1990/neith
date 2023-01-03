// @ts-check

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.createTable("emails", (table) => {
    table.increments("id");
    table.text("email").notNullable();
    table.integer("organization_id");
    table.foreign("organization_id").references("id").inTable("organizations");
  });
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTable("emails");
}
