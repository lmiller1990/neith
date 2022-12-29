import { Router } from "express";
import { User } from "../models/user.js";
import debugLib from "debug";
import { Session } from "../models/session.js";

const debug = debugLib("server:controllers:auth");

export const auth = Router();

auth.get("/sign_up", (req, res) => {
  res.render("sign_up");
});

auth.post<{}, {}, { email: string }>("/sign_in", (req, res) => {
  req.db("organizations").where({ email: req.body.email }).first();
  console.log(req.body);
});

auth.post<{}, {}, { organization: string; email: string; password: string }>(
  "/sign_up",
  async (req, res) => {
    debug("got req with body %o", req.body);
    try {
      const organizationId = await User.signUp(
        req.db,
        req.body.organization,
        req.body.email,
        req.body.password
      );
      const sessionId = await Session.create(req.db, organizationId);
      res.cookie(Session.COOKIE_ID, sessionId, { httpOnly: true });
      debug("created session with id %s", sessionId);
    } catch (e) {
      debug("failed to sign up user %s", e.message);
      //
    }

    res.redirect("/app");
  }
);

// User.createSecurePassword(req.)
