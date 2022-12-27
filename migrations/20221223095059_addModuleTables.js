// @ts-check

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.createTable("modules", (table) => {
    table.increments("id");
    table.integer("organization_id").notNullable();
    table.foreign("organization_id").references("id").inTable("organizations");
    table.text("module_name").notNullable().unique();
    table.enu("notify_when", ["major", "minor", "prerelease"], {
      useNative: true,
      enumName: "notify_when",
    });
  });
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTable("modules");
}
