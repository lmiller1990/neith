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