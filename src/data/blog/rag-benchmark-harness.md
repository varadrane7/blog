---
author: Varad Rane
pubDatetime: 2026-11-19T13:00:00Z
title: "72% to 93%: Measure Your RAG Pipeline Before You Have Opinions"
slug: rag-benchmark-harness
featured: false
draft: true
tags:
  - rag
  - llm
  - benchmarking
  - ai-engineering
description: >
  The biggest accuracy gain in a local RAG pipeline I built didn't come from a better model. It came from how the documents were split, and I only found that out because I built the benchmark before picking a configuration.
---

<!-- TODO(Varad): before publishing, confirm (1) exactly how "retrieval accuracy" was scored (top-k hit rate? what k? how many test questions?) and (2) which chunking variants and quantization levels you compared. Fill the two marked spots below, and (3) check the "My read of why" paragraph matches what you saw. -->

I built a retrieval-augmented generation (RAG) pipeline that had to run entirely on one machine: the documents were sensitive, so nothing could leave the environment, and the whole stack had to fit in 8 GB of VRAM. Ollama for the model, sentence-transformer embeddings, ChromaDB and PostgreSQL for vector storage.

With a budget that tight, every choice trades against another: a bigger model or a longer context, more retrieved chunks or faster answers, a higher-precision quantization or room for everything else. I didn't trust myself to pick by intuition, so before choosing anything I built a benchmarking harness.

The result surprised me. Retrieval accuracy went from 72% to 93%, and the change that did it had nothing to do with the model.

## Table of contents

## What the harness measured

Three things, for every configuration, on the same fixed set of documents and questions:

- **Latency**: time per answer.
- **Throughput**: answers per minute under a steady load.
- **Retrieval quality**: whether the passage that actually answers the question came back from the vector search. <!-- TODO: e.g. "in the top 5 results, over N questions" -->

And three kinds of knobs:

- **Chunking**: how documents are split before embedding. <!-- TODO: list the variants, e.g. fixed-size windows with overlap vs. heading-based markdown sections -->
- **Retrieval**: how many chunks to fetch and how to rank them.
- **Quantization**: which quantized build of the model, trading answer quality against VRAM and speed.

Every run was reproducible: same inputs, results written to a table with the configuration that produced them. "Reproducible" mattered more than any single number, because it let me rerun the whole grid whenever something changed.

## What won

Heading-based markdown chunking. Converting the documents to markdown first and splitting on their own headings, instead of cutting fixed-size windows, raised retrieval accuracy from 72% to 93%.

My read of why: the documents were long and semi-structured. A fixed-size window regularly cut a section in half: the heading that said what the section was about ended up in one chunk and the details in the next. The details on their own no longer looked like the question, so search missed them. Splitting on headings keeps each section's context and its content in the same chunk.

## Two lessons I'd repeat

**1. Measure retrieval separately from generation.** When an answer was wrong, it was usually because the right passage never reached the model, not because the model misread it. A fluent wrong answer looks like a model problem and is often a retrieval problem. Scoring retrieval on its own made that visible immediately.

**2. Build the harness before you have opinions.** Once the harness existed, every argument ("bigger chunks?", "more context?", "higher precision?") turned into a run and a row in a table. Without it, I would have been guessing.

## A minimal version you can build

- A fixed document set and 30 to 100 questions, each with the passage that answers it marked.
- A script that takes one configuration (chunker, embedding model, top-k, generation model), builds the index, runs every question and records latency, throughput and whether the right passage was retrieved.
- A grid runner that loops over configurations and appends to one CSV.
- One chart: retrieval accuracy against latency, one point per configuration.

That's an afternoon of work, and it will tell you more about your pipeline than a week of prompt tweaking.
