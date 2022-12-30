import { Request, Response, NextFunction } from "express";
import { knexClient } from "./express.js";

export function contextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  req.db = knexClient;
  next();
}
