import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import assert from "node:assert";
import { notify_when, schedule } from "../../../dbschema.js";
import { Job } from "../models/job.js";
import { Package } from "../models/package.js";
import { Registry } from "../models/registry.js";

export const createContext = ({ req, res }: CreateExpressContextOptions) => ({
  req,
  res,
});

const t = initTRPC
  .context<inferAsyncReturnType<typeof createContext>>()
  .create();

export const trpc = t.router({
  getUser: t.procedure.query((req) => {
    return { id: req.input, name: "Bilbo" };
  }),

  getOrganizationModules: t.procedure.query(async (req) => {
    const pkgs = await Package.getModulesForOrganization(req.ctx.req.db, {
      organizationId: req.ctx.req.session.organizationId!,
    });

    return Promise.all(
      pkgs.map((pkg) => Registry.fetchPackage(pkg.module_name))
    );
  }),

  getDependencies: t.procedure
    .input((pkgName) => {
      return pkgName as string;
    })
    .query((req) => {
      return Registry.fetchPackage(req.input);
    }),

  savePackage: t.procedure
    .input((pkg) => {
      return pkg as { name: string; frequency: notify_when };
    })
    .mutation((req) => {
      assert(
        req.ctx.req.session.organizationId,
        `organizationId should be defined`
      );
      return Package.saveModuleForOrganization(req.ctx.req.db, {
        name: req.input.name,
        notify: req.input.frequency,
        organizationId: req.ctx.req.session.organizationId,
      });
    }),

  saveFrequency: t.procedure
    .input((schedule) => {
      return schedule as schedule;
    })
    .mutation((req) => {
      return Job.updateJobScheduleForOrganization(req.ctx.req.db, {
        organizationId: req.ctx.req.session.organizationId!,
        jobSchedule: req.input,
      });
    }),
});

// export type definition of API
export type TRPC_Router = typeof trpc;
