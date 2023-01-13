import { Router } from "express";
import { User } from "../models/user.js";
import debugLib from "debug";
import { Session } from "../models/session.js";

const debug = debugLib("notifier:server:controllers:auth");

export const auth = Router();

auth.get("/sign_up", (req, res) => {
  res.render("sign_up");
});

auth.get("/sign_in", (req, res) => {
  res.render("sign_in");
});

auth.post("/sign_out", async (req, res) => {
  if (!req.session.organizationId) {
    return res.redirect("/");
  }

  debug("signing out id: %s", req.session.organizationId);

  res.cookie(Session.COOKIE_ID, "", { httpOnly: true });
  res.redirect("/");
});

auth.post<{}, {}, { email: string; password: string }>(
  "/sign_in",
  async (req, res) => {
    const { password, ...rest } = req.body;
    debug("/sign_in: got req with body %o", rest);
    try {
      const organizationId = await User.signIn(
        req.db,
        req.body.email,
        req.body.password
      );

      const sessionId = await Session.create(req.db, organizationId);

      res.cookie(...Session.makeSessionCookie(sessionId));
    } catch (_err) {
      const e = _err as Error;
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

auth.post<
  {},
  {},
  { timezone: string; organization: string; email: string; password: string }
>("/sign_up", async (req, res) => {
  const { password, ...rest } = req.body;
  debug("/sign_up: got req with body %o", rest);
  try {
    const organizationId = await User.signUp(
      req.db,
      req.body.organization,
      req.body.email,
      req.body.password,
      req.body.timezone
    );

    const sessionId = await Session.create(req.db, organizationId);
    res.cookie(...Session.makeSessionCookie(sessionId));

    debug("created session with id %s", sessionId);
  } catch (_err) {
    const e = _err as Error;
    debug("failed to sign up user %s", e.message);
    return res.render("sign_up", {
      flash: {
        type: "error",
        message: e.message,
      },
    });
  }

  res.redirect("/app");
});
