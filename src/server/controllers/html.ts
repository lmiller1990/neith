import { Router } from "express";

export const html = Router()

html.get("/", (req, res) => {
  res.render('index')
})