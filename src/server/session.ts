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
    await req.db("sessions").insert({ id });

    req.session = { id };
    res.cookie(COOKIE, id);

    return next();
  }

  const session = await req
    .db("sessions")
    .where("id", sessionId)
    .first()
    .returning<{ id: string; organization_id: string }>([
      "id",
      "organization_id",
    ]);

  if (sessionId && session) {
    req.session = {
      id: session.id,
      organizationId: parseInt(session.organization_id, 10),
    };
    res.locals.organizationId = session.organization_id
    return next();
  }

  const [{ id }] = await req
    .db("sessions")
    .insert({ id: randomUUID() })
    .returning("id");
  req.session = { id };
  res.cookie(COOKIE, id);

  next();
}
