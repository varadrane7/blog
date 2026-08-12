---
author: Varad
pubDatetime: 2026-05-28T14:36:00Z
modDatetime: 2026-08-12T19:47:00Z
title: "SplitSync: A Privacy-First, Proportional Bill Splitter for Splitwise"
slug: splitsync
featured: true
draft: false
tags:
  - nextjs
  - typescript
  - pwa
  - open-source
  - splitwise
description: >
  Introducing SplitSync, a premium progressive web app that seamlessly integrates with Splitwise. It solves the split-penny problem, dynamically calculates proportional tax and tips, and respects your privacy.
---

[View SplitSync on GitHub](https://github.com/varadrane7/bill-splitter)

> **A premium, privacy-first, itemized bill-splitting PWA that seamlessly integrates with Splitwise.**

## Update: Discontinuing Splitwise Integration

> **August 2026 Update**: The Splitwise integration feature in SplitSync is being discontinued.
>
> According to the [Splitwise Developer Terms of Use](https://dev.splitwise.com/#section/Terms-of-Use/Overview):
>
> > *"Splitwise may impose conditions on the use of the Self-Serve API, including, for example, maintaining an active Splitwise Pro subscription."*
>
> Since I do not maintain an active Splitwise Pro subscription, I can no longer use the API and am stopping the Splitwise authentication and sync integration. SplitSync will continue to operate as a standalone, privacy-first itemized bill splitter.

We've all been there: a large group dinner, a massive receipt, and the inevitable headache of figuring out who owes what. While apps like Splitwise are great for tracking debts, entering a complex, itemized receipt with tax, tip, and shared items is still a tedious manual process.

I built **SplitSync** (formerly just "Bill Splitter") to solve this exact problem. It's a progressive web application designed to take the friction out of itemized splitting, handle the math perfectly (yes, even the pennies), and sync effortlessly with your Splitwise account.

## Why SplitSync?

Most bill-splitting tools are either too simple (splitting the total evenly) or require you to create an account on yet another platform. SplitSync bridges the gap with powerful features and a strict privacy-first architecture.

### 1. Dynamic Itemized Splitting

Add items from your receipt, set their costs, and assign them to people with ease. SplitSync is designed for power users, featuring fluid keyboard shortcuts. You can use `Alt + 1-9` to instantly assign an item to specific friends, and hit `Enter` to quickly add the next item. 

### 2. Proportional Tax & Tip Distribution

Forget the flat-rate tip split. SplitSync automatically calculates and distributes taxes and tips *proportionally* based on each person's actual subtotal consumption. If someone ordered a $50 steak and another had a $10 salad, they pay their fair share of the tip and tax.

### 3. Penny-Accurate Rounding Correction

The notorious "split-penny problem" is finally solved. When splitting odd numbers, rounding discrepancies are automatically balanced and allocated to the highest spender. The final sum will match the receipt total to the exact cent.

### 4. Direct Splitwise Integration

No more copying and pasting totals. SplitSync uses secure OAuth 2.0 to authenticate with your Splitwise account. It fetches your friends and groups, allowing you to export the itemized bill with a detailed breakdown directly as a Splitwise expense.

### 5. Installable PWA with Adaptive Dark Mode

Whether you're at a dimly lit restaurant or a bright cafe, SplitSync looks great. It features a premium, high-contrast adaptive dark/light theme. Plus, as a Progressive Web App, you can install it on iOS, Android, or Desktop for a native feel and offline support.

## Architecture: Serverless and Privacy-First

One of my core goals was to ensure user data remains private. SplitSync operates completely serverless.

- **No Databases**: We don't store your bills. Drafts, items, and assignees are kept in your browser's `localStorage`.
- **Secure Auth**: Your Splitwise Access Token is stored in a secure, HTTP-Only cookie, protecting against XSS attacks.
- **Ephemeral Profiles**: Friend and group data fetched from Splitwise is kept only in React context state memory and never persisted.

## The Tech Stack

SplitSync is built with modern web technologies for performance and maintainability:

- **Framework**: Next.js 16 (App Router)
- **UI & Logic**: React 19, TypeScript
- **Styling**: Tailwind CSS & CSS Variables
- **PWA Tooling**: `@ducanh2912/next-pwa`
- **Deployment**: Multi-stage Docker build optimized for lightweight node servers

## Try It Out

SplitSync is open-source and ready for your next group outing. 

You can check out the live version at [bills.varadrane.com](https://bills.varadrane.com/) or explore the source code on GitHub:

```bash
# Clone the repository
git clone https://github.com/varadrane7/bill-splitter.git
cd bill-splitter

# Install dependencies and run locally
npm install
npm run dev
```

Stop fighting over the receipt and let the math handle itself. Enjoy splitting! 🍕
