// @ts-check

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.alterTable("organizations", (table) => {
    table.text("slack_workspace");
    table.text("slack_channel");
  });
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.alterTable("organizations", async (table) => {
    table.dropColumn("slack_workspace");
    table.dropColumn("slack_channel");
  });
}
