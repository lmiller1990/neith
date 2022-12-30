import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { knexClient } from "../express";

// export const createContext = async (opts) => {

//   return {
//     db: knexClient,
//   };
// };

export const createContext = ({
  req,
  res,
}: CreateExpressContextOptions) => ({ req, res });

const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create();

export const trpc = t.router({
  getUser: t.procedure.query((req) => {
    return { id: req.input, name: "Bilbo" };
  }),

  getDependencies: t.procedure.query((req) => {
    console.log(req.ctx.req.db);
    return [];
  }),
});

// export type definition of API
export type TRPC_Router = typeof trpc;
