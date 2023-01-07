import { Router } from "express";
import { requiresAuth } from "../middleware/requiresAuth.js";
import { Html } from "../models/html.js";

export const html = Router();

html.get("/", (req, res) => {
  res.render("index");
});

html.get("/app/*", requiresAuth, (_req, res) => {
  if (process.env.NODE_ENV === "development") {
    res.send(Html.appDev()).end();
  } else {
    console.log(Html.appProd());
    res.send(Html.appProd()).end();
  }
});
