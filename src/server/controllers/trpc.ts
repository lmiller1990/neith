import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import assert from "node:assert";
import debugLib from "debug";
import { notify_when, Organizations, schedule } from "../../../dbschema.js";
import { Job } from "../models/job.js";
import { Organization } from "../models/organization.js";
import { Package } from "../models/package.js";
import { Registry } from "../models/registry.js";
import { rescheduleJob } from "../services/jobs.js";

const debug = debugLib("neith:server:controllers:trpc");

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
      pkgs.map(async (pkg) => ({
        ...(await Registry.fetchPackage(pkg.module_name)),
        notifyWhen: pkg.notify_when,
      }))
    );
  }),

  getDependencies: t.procedure
    .input((pkgName) => {
      return pkgName as string;
    })
    .query((req) => {
      return Registry.fetchPackage(req.input);
    }),

  getOrganizationEmails: t.procedure.query(async (req) => {
    assert(
      req.ctx.req.session.organizationId,
      `organizationId should be defined`
    );
    const emails = await Organization.getEmails(req.ctx.req.db, {
      organizationId: req.ctx.req.session.organizationId,
    });
    return emails;
  }),

  deleteEmail: t.procedure
    .input((id) => id as number)
    .mutation(async (req) => {
      assert(
        req.ctx.req.session.organizationId,
        `organizationId should be defined`
      );
      return Organization.deleteEmail(req.ctx.req.db, {
        organizationId: req.ctx.req.session.organizationId,
        id: req.input,
      });
    }),

  addEmail: t.procedure
    .input((value) => {
      return value as string;
    })
    .mutation(async (req) => {
      assert(
        req.ctx.req.session.organizationId,
        `organizationId should be defined`
      );
      return Organization.addEmail(req.ctx.req.db, {
        organizationId: req.ctx.req.session.organizationId,
        email: req.input,
      });
    }),

  getNotificationSettings: t.procedure.query(async (req) => {
    assert(
      req.ctx.req.session.organizationId,
      `organizationId should be defined`
    );
    const model = await Organization.getNotificationSettings(req.ctx.req.db, {
      organizationId: req.ctx.req.session.organizationId,
    });
    return model;
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

  deleteDependency: t.procedure
    .input((obj) => obj as string)
    .mutation(async (req) => {
      return Package.delete(req.ctx.req.db, {
        moduleName: req.input,
        organizationId: req.ctx.req.session.organizationId!,
      });
    }),

  saveFrequency: t.procedure
    .input((schedule) => {
      return schedule as schedule;
    })
    .mutation(async (req) => {
      debug("updating frequency to %s", req.input);
      await Job.updateJobScheduleForOrganization(req.ctx.req.db, {
        organizationId: req.ctx.req.session.organizationId!,
        jobSchedule: req.input,
      });

      return rescheduleJob(req.ctx.req.db, req.ctx.req.session.organizationId!);
    }),

  getOrganization: t.procedure.query(async (req) => {
    return Organization.getOrganizationById(req.ctx.req.db, {
      organizationId: req.ctx.req.session.organizationId!,
    });
  }),

  updateOrganization: t.procedure
    .input((input) => input as Partial<Organizations>)
    .mutation(async (req) => {
      return Organization.updateOrganization(req.ctx.req.db, {
        organizationId: req.ctx.req.session.organizationId!,
        props: req.input,
      });
    }),
});

// export type definition of API
export type TRPC_Router = typeof trpc;
