## Technologies

The app uses:

- [Postgres](https://www.postgresql.org/) for the database
- [trpc](https://trpc.io/) for the API layer
- [knex](https://knexjs.org/) for queries
- [Vite](https://vitejs.dev/) for development and [Vitest](https://vitest.dev/) for testing
- [Cypress](https://www.cypress.io/) for End to End and Component Testing
- [Vue.js](https://vuejs.org/) with the _Composition API_ and `<script setup>` for the syntax
- [Express](https://expressjs.com/) for the HTTP server

## Database

The schema is managed with [knex](https://knexjs.org).

### Creating a Database

- Create a database (by default we assume your database is called **notifier_test**).
- Update `knexfile.js` with your credentials.
- Run `npm run db:migrate` to run the migrations.

### Adding a Migration

- Run `npm db:make <name>`
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
