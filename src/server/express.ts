import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import path from "path";
import { PORT } from "../shared/constants.js";
import url from "node:url";
import knex from "knex";
import type { Knex } from "knex";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import knexConfig from "../../knexfile.js";
import { sessionMiddleware } from "./session.js";
import { contextMiddleware } from "./context.js";
import { html } from "./controllers/html.js";
import { auth } from "./controllers/auth.js";
import debugLib from "debug";
import { requiresAuth } from "./middleware/requiresAuth.js";
import { createContext, trpc } from "./controllers/trpc.js";
import { inferAsyncReturnType } from "@trpc/server";

const debug = debugLib("server:express");

declare global {
  namespace Express {
    interface Request {
      db: Knex;
      session: {
        id: string;
        organizationId?: string;
      };
    }
  }
}

export const knexClient = knex(knexConfig);

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(contextMiddleware);
app.use(sessionMiddleware);

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(html);
app.use(auth);

app.get("/app/*", (_req, res) => {
  res.redirect("/app");
});

app.use(
  "/trpc",
  requiresAuth,
  trpcExpress.createExpressMiddleware({
    router: trpc,
    createContext: createContext,
  })
);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
