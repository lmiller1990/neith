import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { notify_when } from "../../../dbschema.js";
import { Registry } from "../models/registry.js";

// export const createContext = async (opts) => {

//   return {
//     db: knexClient,
//   };
// };

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

  getDependencies: t.procedure
    .input((pkgName: string) => {
      return pkgName;
    })
    .query((req) => {
      return Registry.fetchPackage(req.input);
    }),

  savePackage: t.procedure
    .input((pkg: { name: string; frequency: notify_when }) => pkg)
    .mutation((req) => {
      console.log(`Time to say ${req.input}`);
    }),
});

// export type definition of API
export type TRPC_Router = typeof trpc;
