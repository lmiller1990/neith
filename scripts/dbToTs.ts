import { execa } from "./utils.js";

async function main() {
  const whoami = (await execa("whoami")).trim();

  try {
    const pw = process.env.POSTGRES_PASSWORD
      ? `:${process.env.POSTGRES_PASSWORD}`
      : "";
    const db = `postgresql://${whoami}${pw}@localhost/${process.env.POSTGRES_DB}`;
    await execa(`npx pg-to-ts generate -c ${db} -o dbschema.ts`);
  } catch (e) {
    console.log(e);
  }
}

main();
