import { execa } from "./utils.js";

async function main() {
  const whoami = await (await execa("whoami")).trim();

  try {
    const db = `postgresql://${whoami}@localhost/${process.env.POSTGRES_DB}`;
    await execa(`npx pg-to-ts generate -c ${db} -o dbschema.ts`);
  } catch (e) {
    console.log(e);
  }
}

main();
