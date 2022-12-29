import { NextFunction, Request, Response } from "express";

export function requiresAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.organizationId) {
    next();
  } else {
    res.redirect("/");
  }
}
