import bcrypt from "bcrypt";
import { Knex } from "knex";
import debugLib from "debug";
import { InvalidCredentialsError, OrganizationExistsError } from "../errors.js";

const debug = debugLib("neith:server:models:user");

export const User = {
  createSecurePassword(plaintext: string) {
    const saltRounds = 10;
    return bcrypt.hash(plaintext, saltRounds);
  },

  async signIn(db: Knex, email: string, plaintext: string) {
    const org = await db("organizations")
      .where({ organization_email: email })
      .first();

    if (!org) {
      debug("no organzation with email %s", email);
      throw new InvalidCredentialsError();
    }

    console.log(plaintext, org);

    const hash = await bcrypt.compare(plaintext, org.organization_password);

    if (!hash) {
      throw new InvalidCredentialsError();
    }

    return org.id;
  },

  async signUp(
    db: Knex,
    organzationName: string,
    email: string,
    plaintext: string,
    timezone: string
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

    await db("jobs").insert({
      job_description: `Default job for for organization ${id}`,
      job_last_run: null,
      job_name: "default_job",
      job_schedule: "weekly",
      job_starts_at: null,
      organization_id: id,
      timezone,
    });

    debug("created organization with id %s", id);

    return id;
  },
};
