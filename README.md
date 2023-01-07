## Technologies

The app uses:

- [Postgres](https://www.postgresql.org/) for the database
- [trpc](https://trpc.io/) for the API layer
- [knex](https://knexjs.org/) for queries
- [Vite](https://vitejs.dev/) for development and [Vitest](https://vitest.dev/) for testing
- [Tailwind](https://tailwindcss.com/) for styling
- [Cypress](https://www.cypress.io/) for End to End and Component Testing
- [Vue.js](https://vuejs.org/) with the _Composition API_ and `<script setup>` for the syntax
- [Express](https://expressjs.com/) for the HTTP server

## Getting Started

This project just uses plain old `npm`. Clone it and run `npm install`. You'll also need to create a database.

## Database

The schema is managed with [knex](https://knexjs.org).

### Creating a Database

- Create a database (by default we assume your database is called **notifier_test**).
  - You can run `createdb notifier_test` to create, and `dropdb notifier_test` to delete it).
- Update `knexfile.js` with your credentials.
- Run `npm run db:migrate` to run the migrations.

### Adding a Migration

If you need to add a new table or modify an exist one, do so via a migration.

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

## Tests

- Run the Cypress End to End test with `npm run test:e2e`.
- Run the Node.js tests (eg, migrations etc) with `npm run test:component`
- Run the Component tests with `npm run test:unit`

## Deployment

- Build the server and frontend with `npm run build`.
- To start the server, `cd src/server` and run `NODE_ENV=production POSTGRES_USER=<user> POSTGRES_PASSWORD=<password node express.js`.
