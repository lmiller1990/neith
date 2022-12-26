# Stories

High level overview of some of the things a user can do.

## Spontaneous Notifications

- The current version of Vite is 3.9.0
- User is subscribed to all major + all pre-releases
- Vite v4.0.0-alpha.1 appears on npm
- The user receives an email and slack notification immediately
- "Vite has a new pre-release available. The current major version, `latest`, is 3.9.0. 4.0.0-alpha.1 is now available. <link to repo or npm>"

## Batched Notifications

- A user is subscribed to Vue and Vite, minor versions only
- They want an email, once a week, on Monday at 9:00am
- On Wednesday, a new minor is released for Vue (3.1.0)
- On Friday, a new minor is released for Vite (4.1.0)
- On Saturday, a new minor is released for Vite (4.2.0)
- On Monday morning, the user receives ane email containing information about the latest version of both minors (Vue 3.1.0 and Vite 4.2.0)
- Vite 4.1.0's notification is obviated by 4.2.0

## Notifications

### Supported Types

For the MVP, I'd like to support two types of notifications:

- Email (can add as many emails as you like)
- Push (for now, just Slack. [Docs](https://api.slack.com/messaging/webhooks))

### Frequency

For the initial release, I'd like to support

- Fine grained (per-dependency)
- Scheduled (Daily, Weekly)
