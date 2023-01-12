import { Knex } from "knex";
import { Modules, notify_when } from "../../../dbschema.js";
import debugLib from "debug";

const debug = debugLib("server:models:package");

export const Package = {
  async getModulesForOrganization(
    db: Knex,
    options: { organizationId: number }
  ): Promise<Modules[]> {
    return db("modules").where({
      organization_id: options.organizationId,
    });
  },

  async delete(
    db: Knex,
    options: {
      organizationId: number;
      moduleName: string;
    }
  ): Promise<void> {
    return db("modules")
      .where({
        module_name: options.moduleName,
        organization_id: options.organizationId,
      })
      .delete();
  },

  async saveModuleForOrganization(
    db: Knex,
    options: {
      name: string;
      notify: notify_when;
      organizationId: number;
    }
  ): Promise<void> {
    const e = await db("modules")
      .where({
        organization_id: options.organizationId,
        module_name: options.name,
      })
      .first();

    if (e) {
      debug(
        "updating module_id %s for organization_id %s",
        e.id,
        options.organizationId
      );
      return db("modules")
        .where({
          organization_id: options.organizationId,
          module_name: options.name,
        })
        .update({
          notify_when: options.notify,
        });
    }

    debug(
      "adding new module_id %s for organization_id %s",
      options.name,
      options.organizationId
    );
    return db("modules").insert({
      organization_id: options.organizationId,
      module_name: options.name,
      notify_when: options.notify,
    });
  },
};
