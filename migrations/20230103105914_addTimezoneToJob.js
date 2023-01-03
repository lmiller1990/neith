// @ts-check

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.alterTable("jobs", (table) => {
    table.text("timezone").notNullable();
  });
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.alterTable("jobs", (table) => {
    return table.dropColumn("timezone");
  });
}
