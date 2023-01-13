/* tslint:disable */
/* eslint-disable */
const emails = {
  tableName: "emails",
  columns: ["id", "email", "organization_id"],
  requiredForInsert: ["email"],
  primaryKey: "id",
  foreignKeys: {
    organization_id: {
      table: "organizations",
      column: "id",
      $type: null,
    },
  },
  $type: null,
  $input: null,
};
const jobs = {
  tableName: "jobs",
  columns: [
    "id",
    "organization_id",
    "job_name",
    "job_description",
    "job_starts_at",
    "job_last_run",
    "job_schedule",
    "timezone",
  ],
  requiredForInsert: ["organization_id", "job_schedule", "timezone"],
  primaryKey: "id",
  foreignKeys: {
    organization_id: {
      table: "organizations",
      column: "id",
      $type: null,
    },
  },
  $type: null,
  $input: null,
};
const knex_migrations = {
  tableName: "knex_migrations",
  columns: ["id", "name", "batch", "migration_time"],
  requiredForInsert: [],
  primaryKey: "id",
  foreignKeys: {},
  $type: null,
  $input: null,
};
const knex_migrations_lock = {
  tableName: "knex_migrations_lock",
  columns: ["index", "is_locked"],
  requiredForInsert: [],
  primaryKey: "index",
  foreignKeys: {},
  $type: null,
  $input: null,
};
const modules = {
  tableName: "modules",
  columns: ["id", "organization_id", "module_name", "notify_when"],
  requiredForInsert: ["organization_id", "module_name", "notify_when"],
  primaryKey: "id",
  foreignKeys: {
    organization_id: {
      table: "organizations",
      column: "id",
      $type: null,
    },
  },
  $type: null,
  $input: null,
};
const organizations = {
  tableName: "organizations",
  columns: [
    "id",
    "organization_name",
    "organization_email",
    "organization_password",
    "slack_workspace",
    "slack_channel",
  ],
  requiredForInsert: [
    "organization_name",
    "organization_email",
    "organization_password",
  ],
  primaryKey: "id",
  foreignKeys: {},
  $type: null,
  $input: null,
};
const sessions = {
  tableName: "sessions",
  columns: ["id", "created", "organization_id"],
  requiredForInsert: ["id"],
  primaryKey: null,
  foreignKeys: {
    organization_id: {
      table: "organizations",
      column: "id",
      $type: null,
    },
  },
  $type: null,
  $input: null,
};
export const tables = {
  emails,
  jobs,
  knex_migrations,
  knex_migrations_lock,
  modules,
  organizations,
  sessions,
};
