import bcrypt from "bcrypt";
import { Knex } from "knex";
import debugLib from "debug";
import { OrganizationExistsError } from "../errors.js";
import { Session } from "./session.js";

const debug = debugLib("server:models:user");

export class User {
  static createSecurePassword(plaintext: string) {
    const saltRounds = 10;
    return bcrypt.hash(plaintext, saltRounds);
  }

  static async signUp(
    db: Knex,
    organzationName: string,
    email: string,
    plaintext: string
  ) {
    const exists = await db("organizations")
      .where({ organization_email: email })
      .first();

    if (exists) {
      throw new OrganizationExistsError(email);
    }

    const hash = await bcrypt.hash(plaintext, 10);

    const [{ id }] = await db("organizations")
      .insert({
        organization_name: organzationName,
        organization_email: email,
        organization_password: hash,
      })
      .returning("id");
    
    debug("created organization with id %s", id);

    return id
  }
}
