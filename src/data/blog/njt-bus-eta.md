---
author: Varad Rane
pubDatetime: 2026-11-05T13:00:00Z
title: "When the Transit API Says Nothing: Building a Bus ETA Service With Honest Fallbacks"
slug: njt-bus-eta-fallbacks
featured: true
draft: true
tags:
  - python
  - gtfs
  - home-assistant
  - reliability
  - docker
description: >
  NJ Transit's realtime feed predicts one of my two buses and stays silent on the other. Here's the small Python service I built to fill the gap: realtime first, then GPS projected onto the route, then the timetable, and an explicit "stale" state instead of a confident wrong number.
---

Two buses stop near my apartment. NJ Transit's realtime feed publishes arrival predictions for one of them. For the other, in the direction I actually ride, it publishes nothing: no trip update for my stop, no delay to carry forward. The official app falls back to the printed timetable and shows it as if it were live.

That's the failure mode I care about most in any system: not "no answer", but a confident wrong answer. So I built a small service that answers one question for four people in my apartment, "when should I leave?", and is honest about how it knows.

## Table of contents

## The shape of the problem

NJ Transit exposes GTFS-Realtime: protobuf feeds of trip updates (predicted arrival times) and vehicle positions (GPS fixes). Pair that with the static GTFS zip (routes, trips, stop times, stop coordinates) and you have everything needed for an ETA, in theory.

In practice each bus falls into one of three cases:

| Case | What the feed gives you | What I do |
| --- | --- | --- |
| Predicted | A trip update with an arrival time or delay for my stop, or for an earlier stop | Use it; carry an earlier stop's delay forward if mine is missing |
| Tracked, not predicted | A GPS fix for the vehicle, but no prediction | Project the fix onto the route and estimate |
| Not departed | Nothing useful yet | Use the timetable, and label it as such |

Every ETA the service returns carries a `source` field (`realtime`, `gps` or `scheduled`), and the dashboard shows it. A number tagged "(est)" means something different from a live prediction, and the people reading it deserve to know which one they're looking at.

## Tier 1: realtime, with delay carry-forward

The obvious path: find the `stop_time_update` for my stop and read its arrival time. The less obvious one: when the feed has an update for an *earlier* stop on the trip but not mine, take that stop's delay and apply it to my stop's scheduled time. A bus running six minutes late three stops ago is very likely still about six minutes late.

Skipped stops are ignored, ETAs more than 90 seconds in the past are dropped, and the earliest remaining arrival wins.

## Tier 2: GPS projected onto the route

For the bus the feed won't predict, I still get vehicle positions. The trick is turning a latitude/longitude into "how far along the route is this bus, and how far is my stop."

From the static GTFS I build a polyline for each trip out of its stop coordinates, with cumulative distance and scheduled time at every vertex. A GPS fix is projected onto the nearest segment of that polyline (a flat-earth approximation is plenty at city scale), which gives me:

- how far the bus is from the route (more than 250 m off and I don't trust the match),
- how many metres it has travelled along the route,
- what time the timetable expected it to be at that point.

The remaining distance to my stop divided by the timetable's pace for that stretch gives an ETA. Then I bias it on purpose: the service assumes the bus is running 5 mph faster than the timetable implies. Arriving at the stop a minute early costs a minute. Arriving a minute late costs twenty. The estimate should err in the direction that's cheap to be wrong in.

A few guards keep it from lying:

- GPS fixes older than two minutes are treated as stale, not as a bus that stopped moving.
- A bus within 300 m of its first stop is on layover, so it can't arrive before its scheduled departure.
- A bus already 30 m past my stop is dropped.

## Tier 3: the timetable, labelled

If neither of the above applies, the scheduled time is returned with `source: scheduled`. It's still useful. It just isn't presented as something it isn't.

## Failing loudly

Each route's answer has a `status`: `ok`, `stale`, `no_upcoming`, `error` or `starting`. If the service hasn't had a good poll in three minutes, minutes come back as `null` with `status: stale`. Home Assistant shows a dash, not the last number it happened to see.

That's the whole philosophy in one rule: **a missing answer is better than a stale one dressed up as fresh.**

## Running it

It's a single Python file with a `ThreadingHTTPServer`, polling every 30 seconds, packaged as a Docker container:

- `/api/next` returns all configured routes; `/api/route/<n>` returns one.
- `/debug` shows which headsigns the service has seen at the stop and the GPS candidates it considered, which is how direction filtering gets fixed without reading logs.
- `/healthz` returns 200 only when the last poll succeeded recently.
- Auth tokens are refreshed before they expire, and the static GTFS zip is cached on a volume and refreshed daily.

The container runs with a read-only root filesystem, every Linux capability dropped, `no-new-privileges` and a 256 MB memory cap. It's a hobby service; it doesn't cost anything to run it like a production one.

## The Home Assistant side

Two REST sensors poll the service. A Markdown card colours each ETA (red at five minutes or less, yellow at six, green from seven) and tags estimates with "(sched)" or "(est)". A binary sensor flips to "leave now" when the next bus is close enough, and my e-ink wall panel polls faster while a bus is within 15 minutes.

## What I'd take from this into any data service

- Return provenance with the value. `source` cost one field and removed a whole class of "why was the board wrong?" questions.
- Bias estimates toward the cheaper mistake, deliberately and in one named constant.
- Make staleness a first-class state, not something the client has to infer from timestamps.
- Ship a `/debug` endpoint that explains the service's own decisions.

The same rules apply whether the upstream is a transit feed, a broker's market-data API or an LLM: be explicit about where every answer came from, and refuse to dress up a guess as a fact.
