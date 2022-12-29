import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

const COOKIE = "COOKIE";

export async function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionId = req.cookies[COOKIE];

  if (!sessionId) {
    const id = randomUUID();
    await req.db("sessions").insert({ id: id });
    req.session = { id };
    res.cookie(COOKIE, id);

    return next();
  }

  const session = await req.db("sessions")
    .where("id", sessionId)
    .first();

  if (sessionId && session) {
    req.session = { id: sessionId };
    return next();
  }

  const id = randomUUID();
  await req.db("sessions").insert({ id });
  req.session = { id };
  res.cookie(COOKIE, id);

  next();
}
