import knex from "knex";
import knexConfig from "../knexfile.js";

export function createKnex(database: string) {
  return knex({
    connection: { ...knexConfig.connection, database },
  });
}
