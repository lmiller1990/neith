import { Router } from "express";
import path from "node:path";
import { requiresAuth } from "../middleware/requiresAuth.js";
import { Html } from "../models/html.js";
import url from "node:url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export const html = Router();

html.get("/", (req, res) => {
  res.render("index");
});

html.get("/style.css", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "style.css"));
});

html.get("/tailwind.components.css", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "tailwind.components.css"));
});

html.get("/app*", requiresAuth, (_req, res) => {
  if (process.env.NODE_ENV === "development") {
    res.send(Html.appDev()).end();
  } else {
    res.send(Html.appProd()).end();
  }
});
