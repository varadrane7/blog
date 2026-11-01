---
author: Varad Rane
pubDatetime: 2026-11-24T13:00:00Z
title: "Running a Homelab Like Production When Your Users Are Your Flatmates"
slug: homelab-production-habits-for-flatmates
featured: false
draft: true
tags:
  - homelab
  - home-assistant
  - self-hosting
  - security
  - docker
description: >
  My home server has four real users who never asked to be beta testers. Here's the short list of production habits that made it something they rely on instead of something they tolerate, and the one I'm still fixing.
---

<!-- TODO(Varad): before publishing, (1) move the NJT credentials from docker-compose.yml into .env, (2) confirm section 1 matches reality (which services use Authentik OIDC vs. its proxy; one switch to revoke access), (3) confirm sections 2 and 4 describe your services generally and not just njt-bus, (4) section 7: keep only if you have actually test-restored a backup. -->

When a homelab has one user, downtime is a learning opportunity. When it has four, and they use it to turn on the kitchen lights, know when to leave for the bus and find out their laundry is done, downtime is a complaint in the group chat.

I wrote about the [hardware and networking side](/posts/multi-location-homelab/) before. This post is about the habits: the things I'd expect from a production service at work, applied to a smaller blast radius.

## Table of contents

## 1. Sign-in in front of the web services

Self-hosted web apps run behind Authentik, my identity provider, as a single sign-on layer. Services that support OIDC use it directly; the rest sit behind its proxy. Music Assistant signs in through Home Assistant. Nobody has a separate password per app, and turning someone's access off is one switch.

The only clients that talk to Home Assistant's API directly are devices on the home network with their own long-lived token, like the Kindle wall panel, and those tokens live on the device, not in a repo.

## 2. Containers get least privilege by default

New services start from the same template:

```yaml
read_only: true
tmpfs:
  - /tmp
cap_drop: [ALL]
security_opt:
  - no-new-privileges:true
mem_limit: 256m
restart: unless-stopped
```

Most small services need none of the Linux capabilities Docker grants by default and nothing writable except a cache volume. The memory cap means one misbehaving container can't take the house down with it.

## 3. Secrets in env files, never in compose files or git

Credentials go in an `.env` file that's in `.gitignore`, referenced from compose with `env_file`. The compose file and the repo stay safe to publish.

This is the one I'm still cleaning up: an older service had its API credentials inline in the compose file, which I only noticed when preparing it to go public. Writing this checklist down is how I found it.

## 4. Health checks, and stale beats wrong

Every service I write has a health endpoint that reports whether its last successful update was recent, not just whether the process is up. Dashboards show a dash and the word "stale" rather than the last value they happened to see. A bus ETA that's ten minutes old and presented as live is worse than no ETA.

## 5. Features designed per person

Shared homes need per-person automation done properly, or nobody trusts it:

- **Laundry**: each person starts their own timer, and the "done" alert goes only to whoever started the load.
- **Presence**: each phone reports home or away, which drives the "who's home" view and keeps alerts relevant.
- **Bedrooms**: each person's room lights sit behind their own PIN on the shared wall panel; shared spaces stay open to everyone.
- **House alerts** that matter to everyone (a window left open late at night, the bathroom heater left on, a sensor battery running low) show up on the shared screen rather than in one person's notifications.

## 6. Every automation has an off switch a non-engineer can find

If something misbehaves at 2 am, the person who notices shouldn't need me. Automations are named in plain English, experimental ones are prefixed "Test" and left disabled until they've earned it, and the wall panel's admin page can drop the whole thing back to a normal Kindle.

## 7. Backups you've actually restored

Home Assistant takes automatic backups. The habit that matters more, and the one I'm building now, is restoring one on purpose once in a while, so the first restore isn't during an outage.

## Why bother

None of this is hard, and none of it is novel. That's the point: the same hygiene I'd expect from a team at work, practised somewhere I can try things before I'd argue for them in a design review. And it's the difference between a homelab your housemates put up with and one they'd notice if it went away.
