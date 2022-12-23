// @ts-check

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.createTable("modules", (table) => {
    table.increments("id");
    table.text("name").notNullable().unique();
  });

  await knex.schema.createTable("organization_modules", (table) => {
    table.integer("organization_id").notNullable();
    table.integer("module_id").notNullable();
    table.foreign("organization_id").references("id").inTable("organizations");
    table.foreign("module_id").references("id").inTable("modules");
  });

  await knex.schema.createTable("module_versions", (table) => {
    table.increments("id");
    table.integer("module_id").notNullable();
    table.text("version").notNullable();
    table.timestamp("published").notNullable();
    table.foreign("module_id").references("id").inTable("modules");
  });
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTable("module_versions");
  await knex.schema.dropTable("organization_modules");
  await knex.schema.dropTable("modules");
}
