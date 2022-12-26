## Database

The schema is managed with [knex](https://knexjs.org).

### Creating a Database

- Create a database (by default we assume your database is called "notifier").
- Update `knexfile.ts` with your credentials.
- Run `npx knex migrate:latest` to run the migrations.

### Adding a Migration

- Run `npx knex migrate:make <name>`
- Example: `npx knex migrate:make addOrganizationTable`
- Fill out the `up` and `down` migrations
- Write a test for both!

#### Testing a Migration

See [here](./test/migrations/20221220105733_addOrganizationTable.spec.ts) for an example. You should use the `testMigration` function.

```ts
import { expect } from "vitest";
import { testMigration } from "./utils";

testMigration("20221220105733_addOrganizationTable", (verify) => {
  verify.up(async (client) => {
    // verify update works
  });

  verify.down(async (client) => {
    // verify rollback works
  });
});
```
