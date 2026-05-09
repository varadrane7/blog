---
author: Varad
pubDatetime: 2025-12-08T10:00:00Z
title: "LazyCurl: The Terminal Interface for Curl and API Exploration"
slug: lazycurl
featured: true
draft: false
tags:
  - golang
  - tui
  - api
  - tooling
  - open-source
description: >
  Introducing LazyCurl, a powerful Terminal User Interface (TUI) for HTTP API interaction written in Go. It brings modern TUI ergonomics to curl with session management and built-in load testing.
---

[View LazyCurl on GitHub](https://github.com/varadrane7/lazycurl)

> **The Terminal Interface for Curl, Stress Testing, and API Exploration.**

If you spend a lot of time in the terminal, you're likely intimately familiar with `curl`. It's the undisputed king of command-line HTTP requests. But as APIs grow more complex, handwriting nested JSON payloads and juggling half a dozen headers in a single bash command gets tedious fast.

Many developers switch to heavy GUI tools like Postman or Insomnia for this, but that means leaving the terminal and breaking flow state. I wanted something that sat right in the middle: the raw power and compatibility of `curl` combined with the visual feedback and ergonomics of a modern application.

Inspired by the phenomenal `lazygit`, I built **LazyCurl**—a powerful Terminal User Interface (TUI) for HTTP API interaction, written entirely in Go.

## Why LazyCurl?

LazyCurl brings robust session management, visual request editing, and a built-in concurrent load testing engine directly to your terminal. It uses native `curl` under the hood, guaranteeing maximum compatibility and reliability.

Here is what makes LazyCurl stand out:

### 1. Keyboard-First Design

The terminal is all about speed and keyboard efficiency. LazyCurl is designed so you can navigate, edit, and execute requests without ever needing to touch your mouse. Whether you're switching between panes or fine-tuning a payload, Vim-style bindings and intuitive shortcuts keep your hands on the keyboard.

### 2. Interactive Visual Editor

Constructing requests is no longer a guessing game of escaped quotes. LazyCurl features an interactive editor pane that allows you to cleanly modify:

- **Method & URL**: Easily toggle between GET, POST, PUT, DELETE, etc.
- **Headers**: Add, edit, or delete headers in a dedicated, structured view.
- **JSON Body**: A full TUI-supported text area for your request payloads.

### 3. Built-In Load Testing Engine

Perhaps my favorite feature is the integrated stress testing capability. You don't need a separate tool like `hey` or `wrk` for quick sanity checks.

- You can set the number of concurrent workers and the duration of the test.
- As the test runs, a **Real-time Latency Dashboard** plots response times live in ASCII.
- It provides immediate live statistics including throughput, status code distributions, and max/average latencies.

### 4. Project-Based Session Management

Instead of digging through your `~/.bash_history` to find that one specific `curl` command from yesterday, LazyCurl organizes your requests into a session list. You can quickly save, name, and switch between different requests.

## Under the Hood: The Tech Stack

Building a highly responsive, concurrent TUI requires a solid foundation. Here is the stack that powers LazyCurl:

- **Language**: Go (Golang) — chosen for its excellent concurrency primitives and compiled performance.
- **TUI Framework**: [Bubble Tea](https://github.com/charmbracelet/bubbletea) by Charm. It provides a robust architecture based on The Elm Architecture, making complex state management in the terminal a breeze.
- **Styling**: [Lip Gloss](https://github.com/charmbracelet/lipgloss) — also from Charm, bringing CSS-like styling (colors, borders, layouts) to the terminal.
- **CLI Framework**: [Cobra](https://github.com/spf13/cobra) for smooth command-line parsing.
- **Graphing**: [AsciiGraph](https://github.com/guptarohit/asciigraph) to power the live load-testing dashboards.

## Try It Out

LazyCurl is open source under the MIT License. If you have Go 1.21+ installed, you can try it right now:

```bash
# Clone the repository
git clone https://github.com/varadrane7/lazycurl.git
cd lazycurl

# Build the binary
go build -o lazycurl main.go

# Run the TUI
./lazycurl tui
```

I built LazyCurl to scratch my own itch, but I hope it finds a place in your daily developer toolkit. Check it out, break it, and let me know what you think!
