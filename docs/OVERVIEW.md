# Overview

This is a basic overview of the product and how it works.

## Use Case

Tools such as Dependabot and Renovate are good at getting the latest stable version of a dependency and making a PR. This is ideal for the majority of projects, where the goal is to keep everything up to date with the latest stable version.

Some products, especially developer tools, would benefit from knowing when new alpha, beta and pre-releases are published. That way, those products can run their test suites and update their code to be ready for the stable version as soon as it comes out.

This is the problem we are solving. Users can specify which dependencies they are interested in tracking, and receive a push notification (via email, Slack, or other service) when a new version is available. 

Users can decide which version(s) they are interested in receiving a notification for (release candidate, `next` tag, etc) and how frequently they'd like to be notified. Users can also get a separate notification for each update, or batch notifications (eg, a weekly summary).

## How It Works

We maintain a database of dependencies the user is interested in. Let's say the user is interested in `vite`. At some interval (say daily, the user can decide) we poll the npm registry and grab the versions. [The list can be seen here](https://www.npmjs.com/package/vite?activeTab=versions).

If the user wants updates for every `alpha`, and a new one has been published since we last checked (eg, `4.0.0-alpha.7` -> `4.0.0-alpha.8`) we update the database, and notify the user (if they want real time notifications) or add it to their upcoming notification (for batched notifications).

## Design

I am using Figma for design. The low fidelity designs are [publicly viewable](https://www.figma.com/file/dmrXJfBYLahzOrl9lt3y3o/Dependency-Notifier-App?node-id=0%3A1&t=lGyDFDh5qEk4K2fC-1).
