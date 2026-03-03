---
author: Varad Rane
pubDatetime: 2024-01-15T09:00:00Z
# modDatetime: 2025-03-01T12:00:00Z
title: "Building a Multi-Location HomeLab: Self-Hosting Across Two Machines"
slug: multi-location-homelab
featured: false
draft: false
tags:
  - homelab
  - docker
  - infrastructure
  - self-hosting
  - networking
description: >
  How I designed and built a self-hosted infrastructure spanning multiple physical locations, with Docker Swarm for scaling, encrypted networking between sites, and remote access to IoT devices — all without any data leaving unencrypted.
---

I've been running my own homelab since 2020, and what started as a single Raspberry Pi running a few containers has grown into a multi-location setup that hosts this website, several personal projects, and a handful of community tools.

Here's what that looks like now and how I got here.

## Table of contents

## Why Self-Host?

The cloud is convenient, but it has costs — financial and otherwise. For personal projects and experiments, I was paying for services I could run myself with spare hardware. Beyond the economics, there's genuine learning value in managing real infrastructure: you encounter problems that managed services abstract away, and you learn why those abstractions exist.

Self-hosting also gives you control. No vendor lock-in, no surprise pricing changes, and no dependency on someone else's uptime decisions.

## The Architecture

The lab spans two physical locations connected by an encrypted overlay network. Each site has its own hardware running Docker, and Docker Swarm manages workload distribution across both.

```
Location A (Primary)        Location B (Offsite)
┌─────────────────┐         ┌─────────────────┐
│  Docker Swarm   │◄───────►│  Docker Swarm   │
│  Manager Node   │ WireGuard│  Worker Node    │
│                 │ Tunnel   │                 │
│  - Web Apps     │         │  - Backups      │
│  - Databases    │         │  - Overflow     │
│  - IoT Bridge   │         │  - Monitoring   │
└─────────────────┘         └─────────────────┘
```

This gives me redundancy for the workloads that matter and a geographically separate backup target.

## Networking: WireGuard Everywhere

Getting secure connectivity between the two sites was the first real challenge. I use **WireGuard** for the site-to-site tunnel — it's fast, has a minimal attack surface, and the configuration is straightforward once you understand the key exchange model.

Every packet between locations is encrypted in transit. Services on either node can reach each other over private IPs as if they were on the same LAN.

For external access to IoT devices, I run a WireGuard endpoint that allows me to reach in-home devices from anywhere in the world:

- The IoT bridge exposes only the WireGuard port publicly
- All traffic is encrypted before it leaves the local network
- No plaintext data flows through the public internet at any stage

This was a non-negotiable requirement. The IoT landscape is full of devices that want to phone home — keeping all of that traffic inside encrypted tunnels prevents anything sensitive from leaking.

## Container Orchestration: Docker Swarm

I use **Docker Swarm** rather than Kubernetes. The complexity-to-capability ratio of Kubernetes doesn't make sense at homelab scale — Swarm gives me multi-node scheduling, rolling updates, and service discovery with far less operational overhead.

Service definitions look like standard Compose files with a few extra fields:

```yaml
services:
  webapp:
    image: registry.local/webapp:latest
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - overlay_net
```

Swarm handles scheduling replicas across nodes, health checking, and restarting failed containers. For most services, this is all the orchestration I need.

## Automated Deployments

I run a private Docker registry on the primary node. When I push a new image to the registry, a lightweight webhook triggers a Swarm service update.

The flow:

1. Local machine builds and tags an image
2. Push to `registry.local/service:latest`
3. Registry webhook fires
4. Swarm pulls the new image and rolls out the update

Rolling updates mean there's no downtime during deploys for services with multiple replicas. For single-replica services (databases, stateful apps), I accept a brief restart window.

## What's Hosted

**Public-facing:**

- This blog
- [kurlaserver.nl](https://www.kurlaserver.nl) — the homelab's public landing page
- Various small web projects

**Private:**

- Home automation dashboards
- Monitoring stack (Prometheus + Grafana)
- Internal DNS resolver
- Password manager
- Personal file sync

## Lessons Learned

**Start with networking, not services.** I made the mistake early on of standing up services before the networking was solid. Every time I needed to add a new location or reconfigure routing, I had to touch running services. Getting the network layer right first makes everything else easier to add.

**Local DNS is underrated.** Running an internal DNS resolver means I can give human-readable names to everything on the private network (`db.home`, `registry.local`, etc.) instead of memorizing IPs. This scales well as the number of services grows.

**Swarm's overlay network has quirks.** Service discovery works via DNS inside the overlay network, but it only resolves service names, not individual container hostnames. If you need to reach a specific container, you need a different approach. Understanding this saved me hours of debugging.

**Backups are not optional.** I lost data once before I had a proper backup strategy. Now I have automated offsite backups to the second location and a rotation policy that keeps N versions. The cost is minimal; the peace of mind is not.

**IoT isolation is critical.** Consumer IoT devices have poor security track records. Putting them on an isolated VLAN and routing their traffic through the WireGuard tunnel means a compromised IoT device can't pivot to the rest of the network.

## What's Next

A few things on the roadmap:

- **Proper secrets management** — currently using Docker secrets, but I want to move toward Vault or a similar dedicated secrets store
- **Better observability** — the monitoring stack covers metrics, but log aggregation is still ad-hoc
- **Automated TLS** — certificate renewal is manual right now; I want to automate it with ACME

The homelab is perpetually in progress. That's kind of the point.
