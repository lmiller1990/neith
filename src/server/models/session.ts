import { Knex } from "knex";
import { randomUUID } from "node:crypto";

export class Session {
  static COOKIE_ID = 'COOKIE'

  static async create(db: Knex, organzationId?: string) {
    const [{ id }] = await db("sessions").insert({
      organization_id: organzationId,
      id: randomUUID(),
    }).returning("id");

    return id
  }
}
