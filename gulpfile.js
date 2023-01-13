// @ts-check
import gulp from "gulp";
import { spawn } from "node:child_process";

/** @type {Array<ReturnType<typeof spawn>>} */
let serverP = [];

async function server() {
  for (const p of serverP) {
    p.kill();
  }

  const s = spawn(`npm run server`, {
    shell: true,
    stdio: "inherit",
    env: process.env,
  });

  s.on("error", console.error);

  const t = spawn(
    `npx tailwindcss -i ./src/server/tailwind.css --config ./tailwind.server.config.cjs --watch -o ./src/server/style.css`,
    { shell: true, stdio: "inherit" }
  );

  serverP.push(s, t);
}

async function vite() {
  const s = spawn(`npm run vite:dev`, {
    shell: true,
    stdio: "inherit",
    env: process.env,
  });
}

gulp.task("dev", gulp.parallel(server, vite));
