export default {
  client: "pg",
  connection: {
    user: process.env.POSTGRES_USER || "postgres",
    database: process.env.POSTGRES_DB || "notifier",
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: 5432,
  },
};
