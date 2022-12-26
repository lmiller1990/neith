import { Knex } from "knex";
import { OrganzationsActions } from "./actions/organizations";

export class Context {
  knex: Knex;

  constructor(_knex: Knex) {
    this.knex = _knex;
  }

  get organzations() {
    return new OrganzationsActions(this);
  }
}
