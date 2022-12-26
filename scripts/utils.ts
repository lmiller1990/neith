import { exec } from "node:child_process";

export async function execa(cmd: string) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) {
        reject(err);
      }
      resolve(stdout);
    });
  });
}
