# Jobs

Our core functionality depends on executing jobs on a user defined schedule.

## Running Jobs

There are many options for this.

### Cron

The classic unix utility, cron. We probably want to use some kind of JS wrapper, though. It's more expressive.

### Node.js Packages

- node-reqsue: https://github.com/actionhero/node-resque#
- node-schedule: https://github.com/node-schedule/node-schedule
- agenda: https://github.com/agenda/agenda
- bree: https://github.com/breejs/bree

TODO: Evaluate options.

### Managed Service

There are many services that handle jobs. The usual culprits: AWS, Cloudflare, etc. There are also smaller players, most of which are built on the bigger places, such as Modal, etc.

These are probably good options as we scale up, but I'd like to explore managing jobs myself at first, for learning purposes and for flexibility.

Solutions:

- https://temporal.io/

## Source of Truth

Regardless of what library I use, I'd like to have the source of truth be my database. We can persist the description of the jobs there, and easily change the job running library/service later.
