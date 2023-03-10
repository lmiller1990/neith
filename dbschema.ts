/* tslint:disable */
/* eslint-disable */

/**
 * AUTO-GENERATED FILE - DO NOT EDIT!
 *
 * This file was automatically generated by pg-to-ts v.4.1.0
 * $ pg-to-ts generate -c postgresql://username:password@localhost/notifier_test -t emails -t jobs -t knex_migrations -t knex_migrations_lock -t modules -t organizations -t sessions -s public
 *
 */

export type Json = unknown;
export type notify_when = "major" | "minor" | "prerelease";
export type schedule = "daily" | "weekly";

// Table emails
export interface Emails {
  id: number;
  email: string;
  organization_id: number | null;
}
export interface EmailsInput {
  id?: number;
  email: string;
  organization_id?: number | null;
}
const emails = {
  tableName: "emails",
  columns: ["id", "email", "organization_id"],
  requiredForInsert: ["email"],
  primaryKey: "id",
  foreignKeys: {
    organization_id: {
      table: "organizations",
      column: "id",
      $type: null as unknown as Organizations,
    },
  },
  $type: null as unknown as Emails,
  $input: null as unknown as EmailsInput,
} as const;

// Table jobs
export interface Jobs {
  id: number;
  organization_id: number;
  job_name: string | null;
  job_description: string | null;
  job_starts_at: Date | null;
  job_last_run: Date | null;
  job_schedule: schedule;
  timezone: string;
}
export interface JobsInput {
  id?: number;
  organization_id: number;
  job_name?: string | null;
  job_description?: string | null;
  job_starts_at?: Date | null;
  job_last_run?: Date | null;
  job_schedule: schedule;
  timezone: string;
}
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
      $type: null as unknown as Organizations,
    },
  },
  $type: null as unknown as Jobs,
  $input: null as unknown as JobsInput,
} as const;

// Table knex_migrations
export interface KnexMigrations {
  id: number;
  name: string | null;
  batch: number | null;
  migration_time: Date | null;
}
export interface KnexMigrationsInput {
  id?: number;
  name?: string | null;
  batch?: number | null;
  migration_time?: Date | null;
}
const knex_migrations = {
  tableName: "knex_migrations",
  columns: ["id", "name", "batch", "migration_time"],
  requiredForInsert: [],
  primaryKey: "id",
  foreignKeys: {},
  $type: null as unknown as KnexMigrations,
  $input: null as unknown as KnexMigrationsInput,
} as const;

// Table knex_migrations_lock
export interface KnexMigrationsLock {
  index: number;
  is_locked: number | null;
}
export interface KnexMigrationsLockInput {
  index?: number;
  is_locked?: number | null;
}
const knex_migrations_lock = {
  tableName: "knex_migrations_lock",
  columns: ["index", "is_locked"],
  requiredForInsert: [],
  primaryKey: "index",
  foreignKeys: {},
  $type: null as unknown as KnexMigrationsLock,
  $input: null as unknown as KnexMigrationsLockInput,
} as const;

// Table modules
export interface Modules {
  id: number;
  organization_id: number;
  module_name: string;
  notify_when: notify_when;
}
export interface ModulesInput {
  id?: number;
  organization_id: number;
  module_name: string;
  notify_when: notify_when;
}
const modules = {
  tableName: "modules",
  columns: ["id", "organization_id", "module_name", "notify_when"],
  requiredForInsert: ["organization_id", "module_name", "notify_when"],
  primaryKey: "id",
  foreignKeys: {
    organization_id: {
      table: "organizations",
      column: "id",
      $type: null as unknown as Organizations,
    },
  },
  $type: null as unknown as Modules,
  $input: null as unknown as ModulesInput,
} as const;

// Table organizations
export interface Organizations {
  id: number;
  organization_name: string;
  organization_email: string;
  organization_password: string;
  slack_workspace: string | null;
  slack_channel: string | null;
}
export interface OrganizationsInput {
  id?: number;
  organization_name: string;
  organization_email: string;
  organization_password: string;
  slack_workspace?: string | null;
  slack_channel?: string | null;
}
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
  $type: null as unknown as Organizations,
  $input: null as unknown as OrganizationsInput,
} as const;

// Table sessions
export interface Sessions {
  id: string;
  created: Date;
  organization_id: number | null;
}
export interface SessionsInput {
  id: string;
  created?: Date;
  organization_id?: number | null;
}
const sessions = {
  tableName: "sessions",
  columns: ["id", "created", "organization_id"],
  requiredForInsert: ["id"],
  primaryKey: null,
  foreignKeys: {
    organization_id: {
      table: "organizations",
      column: "id",
      $type: null as unknown as Organizations,
    },
  },
  $type: null as unknown as Sessions,
  $input: null as unknown as SessionsInput,
} as const;

export interface TableTypes {
  emails: {
    select: Emails;
    input: EmailsInput;
  };
  jobs: {
    select: Jobs;
    input: JobsInput;
  };
  knex_migrations: {
    select: KnexMigrations;
    input: KnexMigrationsInput;
  };
  knex_migrations_lock: {
    select: KnexMigrationsLock;
    input: KnexMigrationsLockInput;
  };
  modules: {
    select: Modules;
    input: ModulesInput;
  };
  organizations: {
    select: Organizations;
    input: OrganizationsInput;
  };
  sessions: {
    select: Sessions;
    input: SessionsInput;
  };
}

export const tables = {
  emails,
  jobs,
  knex_migrations,
  knex_migrations_lock,
  modules,
  organizations,
  sessions,
};
