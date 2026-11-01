---
author: Varad Rane
pubDatetime: 2026-11-12T13:00:00Z
title: "Don't Let the LLM Do the Math: Splitting Checks Between Code and Models"
slug: dont-let-the-llm-do-the-math
featured: false
draft: true
tags:
  - llm
  - ai-engineering
  - reliability
  - architecture
description: >
  When an LLM reviews records for problems, the instinct is to hand it everything. A better split: deterministic code decides every fact it can, and the model only judges the part that genuinely needs reading comprehension.
---

A pattern I keep coming back to when putting a language model into a review workflow: **the model never does arithmetic, and it never decides anything a query could decide.**

It sounds obvious written down. In practice, the first version of almost every "use an LLM to check these records" feature I've seen hands the model the whole record and asks "is anything wrong here?" That works in a demo and falls apart on the hundredth record.

## Table of contents

## A made-up example

To keep this concrete without describing any real system, take expense reports. Each report has line items with amounts and categories, attached receipts, and a free-text justification ("Client dinner after the quarterly review, four attendees").

A reviewer wants to know two kinds of things:

1. **Structural facts.** Do the line items add up to the total? Is there a receipt for every item over the threshold? Is the date inside the trip? Is the category allowed for this cost centre?
2. **Judgment.** Does the justification actually explain the expense? Does "team offsite" plausibly cover a $900 dinner for two?

Only the second kind needs a model.

## Why the model shouldn't touch the first kind

- **Arithmetic and lookups are where models are least reliable and code is most reliable.** A model will occasionally add wrong, misread a date or treat "USD 40" and "$40.00" as different amounts. Code won't.
- **Real data is messier than the schema.** The same concept is often spelled several ways across years of records. Normalizing that is a job for a mapping table you can test, not for a model to rediscover on every call.
- **Every flag has to be explainable.** "The model thought so" isn't an answer an auditor accepts. "Line items sum to $412, total says $480" is.
- **Determinism makes the system testable.** The structural layer gets unit tests with fixed inputs and expected outputs. You can't regression-test a vibe.

## The split

```
records ──► deterministic checks (SQL / code) ──► facts + exceptions
                                                      │
                     only records with something      │
                     a human would need to judge  ◄───┘
                                │
                                ▼
                    LLM: "does this text justify this?"
                    input: the text + the facts, stated as settled
                    output: verdict + one-sentence reason (JSON)
                                │
                                ▼
                  stored result: which check, which query, which sentence
```

Three rules make it work:

1. **Code runs first and runs everywhere.** Every record goes through the deterministic checks. Most records pass and never reach a model, which also keeps cost proportional to problems, not volume.
2. **The model gets facts, not raw numbers to reinterpret.** The prompt states the computed results as given ("the amount is within policy; the receipt is present") and asks only about the narrative. The prompt also says, plainly, not to re-judge those facts.
3. **The output is structured and narrow.** A verdict from a fixed set, plus a short reason that quotes the text it relied on. Free-form essays are hard to store, compare and audit.

## What you get

- **No invented flags.** The model can't produce a "wrong total" finding, because it was never asked about totals.
- **Traceability.** Each finding points at either a query or a quoted sentence. A reviewer can check either in seconds.
- **Cheaper runs.** Clean records stop at the deterministic layer.
- **A clear place to improve.** When the structural layer misses something, you add a check and a test. When the judgment layer is wrong, you look at one prompt and one kind of input.

## Where this doesn't apply

If the whole task is judgment (summarizing, classifying free text, drafting), there's nothing to split out. The rule is narrower than "don't use LLMs": it's **don't spend a model on anything you could write a test for.**

## The general version

This is the same instinct as keeping business logic out of the UI. Put each decision in the layer that can make it reliably and explain it afterwards. Models are very good at reading. They are a poor substitute for a `SUM()`.
