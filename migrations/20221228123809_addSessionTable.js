// @ts-check

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.createTable("sessions", (table) => {
    table.text("id").notNullable().unique();
    table.timestamp("created").notNullable().defaultTo(knex.fn.now());
    table.integer("organization_id");
    table.foreign("organization_id").references("id").inTable("organizations");
  });
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTable("sessions");
}
