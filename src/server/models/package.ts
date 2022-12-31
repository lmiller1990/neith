import { Knex } from "knex";
import { notify_when } from "../../../dbschema.js";

export const Package = {
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
      return db("modules")
        .where({
          organization_id: options.organizationId,
          module_name: options.name,
        })
        .update({
          notify_when: options.notify,
        });
    }

    return db("modules").insert({
      organization_id: options.organizationId,
      module_name: options.name,
      notify_when: options.notify,
    });
  },
};
