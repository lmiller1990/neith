// @ts-check

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.createTable("jobs", (table) => {
    table.increments("id").notNullable();
    table.integer("organization_id").notNullable();
    table.foreign("organization_id").references("id").inTable("organizations");
    table.text("job_name");
    table.text("job_description");
    table.timestamp("job_starts_at");
    table.timestamp("job_last_run");
    table
      .enu("job_schedule", ["daily", "weekly"], {
        useNative: true,
        enumName: "schedule",
      })
      .notNullable();
  });
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTable("jobs");
  await knex.schema.raw(`drop type schedule;`);
}
