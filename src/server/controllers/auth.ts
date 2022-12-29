import { Router } from "express";
import { User } from "../models/user.js";
import debugLib from "debug";
import { Session } from "../models/session.js";

const debug = debugLib("server:controllers:auth");

export const auth = Router();

auth.get("/sign_up", (req, res) => {
  res.render("sign_up");
});

auth.get("/sign_in", (req, res) => {
  res.render("sign_in");
});

auth.post<{}, {}, { email: string; password: string }>(
  "/sign_in",
  async (req, res) => {
    debug("/sign_in: got req with body %o", req.body);
    try {
      const organizationId = await User.signIn(
        req.db,
        req.body.email,
        req.body.password
      );

      const sessionId = await Session.create(req.db, organizationId);

      res.cookie(...Session.makeSessionCookie(sessionId));
    } catch (e) {
      debug("failed to sign in user %s", e.message);
      return res.render("sign_in", {
        flash: {
          type: "error",
          message: e.message,
        },
      });
    }

    res.redirect("/app");
  }
);

auth.post<{}, {}, { organization: string; email: string; password: string }>(
  "/sign_up",
  async (req, res) => {
    debug("/sign_up: got req with body %o", req.body);
    try {
      const organizationId = await User.signUp(
        req.db,
        req.body.organization,
        req.body.email,
        req.body.password
      );

      const sessionId = await Session.create(req.db, organizationId);
      res.cookie(...Session.makeSessionCookie(sessionId));

      debug("created session with id %s", sessionId);
    } catch (e) {
      debug("failed to sign up user %s", e.message);
      return res.render("sign_up", {
        flash: {
          type: "error",
          message: e.message,
        },
      });
    }

    res.redirect("/app");
  }
);
