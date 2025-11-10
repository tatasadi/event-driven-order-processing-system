---
theme: seriph
background: https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072
title: Event-Driven Architecture with Azure
info: |
  ## Event-Driven Order Processing System
  Learn how to build a production-ready event-driven architecture that processes 1000s of orders per second using Azure.
  Part 1 of 8 - Architecture & Introduction
class: text-center
drawings:
  persist: false
transition: slide-left
mdc: true
duration: 10min
highlighter: shiki
colorSchema: dark
---

# Event-Driven Architecture
## Process 1000s Orders/Second with Azure

Complete Tutorial - Part 1/8

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

<div class="abs-br m-6 flex gap-2">
  <a href="https://github.com/your-repo" target="_blank" alt="GitHub" title="Open in GitHub"
    class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>

---
layout: center
class: text-center
---

# The Black Friday Problem

<div v-click class="text-6xl text-red-400 animate-pulse">
  💥 10,000 Orders in 10 Minutes
</div>

<div v-click class="mt-8">
  <div class="text-4xl text-red-500">Server Crashes</div>
</div>

<div v-click class="mt-4">
  <div class="text-3xl text-orange-400">Orders Lost</div>
</div>

<div v-click class="mt-4">
  <div class="text-3xl text-yellow-400">Customers Angry</div>
</div>

<div v-click class="mt-4">
  <div class="text-4xl text-red-600 font-bold">Revenue Gone 📉</div>
</div>

---
layout: center
class: text-center
transition: fade
---

# What If This Could Happen Instead?

<div
  v-click
  v-motion
  :initial="{ scale: 0, opacity: 0 }"
  :enter="{ scale: 1, opacity: 1, transition: { delay: 300, duration: 500 } }"
  class="text-6xl text-green-400 mt-8"
>
  ✅ Handle Traffic Spikes
</div>

<div
  v-click
  v-motion
  :initial="{ scale: 0, opacity: 0 }"
  :enter="{ scale: 1, opacity: 1, transition: { delay: 600, duration: 500 } }"
  class="text-6xl text-green-400 mt-6"
>
  ✅ Zero Lost Orders
</div>

<div
  v-click
  v-motion
  :initial="{ scale: 0, opacity: 0 }"
  :enter="{ scale: 1, opacity: 1, transition: { delay: 900, duration: 500 } }"
  class="text-6xl text-green-400 mt-6"
>
  ✅ Happy Customers
</div>

<div v-click class="mt-12 text-2xl text-blue-300">
  That's <span class="text-4xl font-bold text-blue-400">Event-Driven Architecture</span>
</div>

---
layout: two-cols
---

# Traditional Synchronous

<div v-click>

### The Problem
Customer submits order → System validates → Checks inventory → Processes payment → Sends email → Updates analytics → **THEN responds**

</div>

<div v-click class="mt-8">

### Response Time
<div class="text-6xl text-red-500 font-bold animate-pulse">8 seconds</div>

</div>

<div v-click class="mt-8 text-red-400">

❌ 1-second delay = **7% conversion loss**

❌ 8 seconds = **50% customers lost**

❌ Any step fails = **Everything fails**

</div>

::right::

<div v-click>

# Event-Driven Approach

### The Solution
Customer submits → **Immediate response** → Everything else happens in background

</div>

<div v-click class="mt-8">

### Response Time
<div class="text-6xl text-green-500 font-bold">80ms</div>

</div>

<div v-click class="mt-8 text-green-400">

✅ **80X faster** response

✅ Sub-100ms - higher conversions

✅ Zero lost orders

✅ Auto-scaling - handle any spike

</div>

---
layout: center
class: text-center
---

# The Key Insight

<div
  v-motion
  :initial="{ y: -50, opacity: 0 }"
  :enter="{ y: 0, opacity: 1, transition: { delay: 300, duration: 800 } }"
  class="mt-12"
>
  <div class="text-5xl font-bold text-blue-400 mb-8">
    Separate Accepting from Processing
  </div>
</div>

<div class="grid grid-cols-2 gap-8 mt-12">
  <div v-click class="p-6 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-blue-400">
    <div class="text-3xl mb-4">1️⃣ Accept</div>
    <div class="text-xl">Store in queue → Return instantly</div>
    <div class="text-4xl mt-4 text-green-400">⚡ 50ms</div>
  </div>

  <div v-click class="p-6 bg-purple-500 bg-opacity-20 rounded-lg border-2 border-purple-400">
    <div class="text-3xl mb-4">2️⃣ Process</div>
    <div class="text-xl">Background processor → Handle work → Retry if fails</div>
    <div class="text-4xl mt-4 text-blue-400">🔄 2-5s</div>
  </div>
</div>

---
layout: center
---

# Architecture Overview

```mermaid {theme: 'dark', scale: 0.6}
graph LR
    A[Next.js Frontend] -->|Submit Order| B[HTTP Function]
    B -->|Publish Message| C[Service Bus Queue]
    C -->|Trigger| D[Queue Processor Function]
    B -->|Log| F[Application Insights]
    D -->|Log| F

    style A fill:#3b82f6,stroke:#60a5fa,stroke-width:4px,color:#000
    style B fill:#22c55e,stroke:#4ade80,stroke-width:4px,color:#000
    style C fill:#f59e0b,stroke:#fbbf24,stroke-width:4px,color:#000
    style D fill:#a855f7,stroke:#c084fc,stroke-width:4px,color:#000
    style F fill:#06b6d4,stroke:#22d3ee,stroke-width:4px,color:#000
```

<div v-click class="text-center mt-8 text-2xl text-gray-400">
  5 Components • Simple • Production-Ready
</div>

---
layout: default
---

# Component 1: Next.js Frontend

<div class="grid grid-cols-2 gap-8">
  <div>
    <div v-click class="mb-5">
      <h3 class="text-xl text-blue-400 mb-2">🏪 Your Storefront</h3>
      <p class="text-base">Where users submit orders</p>
    </div>
    <div v-click class="mb-5">
      <h3 class="text-xl text-green-400 mb-2">🛠 Tech Stack</h3>
      <ul class="text-base list-disc list-inside">
        <li>Next.js</li>
        <li>TypeScript</li>
        <li>TailwindCSS</li>
      </ul>
    </div>
    <div v-click>
      <h3 class="text-xl text-purple-400 mb-2">☁ Hosting</h3>
      <p class="text-base">Azure Static Web Apps</p>
      <p class="text-sm text-gray-400">Globally distributed</p>
    </div>
  </div>

  <div class="flex flex-col items-center justify-center">
    <div v-click class="text-8xl">🌐</div>
  </div>
</div>

---
layout: default
---

# Component 2: HTTP Function

<div class="grid grid-cols-2 gap-8">
  <div>
    <div v-click class="mb-6">
      <h3 class="text-2xl text-blue-400 mb-3">📝 The Receptionist</h3>
      <p class="text-lg text-gray-300">
        Like a receptionist at a busy restaurant
      </p>
    </div>
    <div v-click>
      <h3 class="text-xl text-green-400 mb-2">What It Does:</h3>
      <ol class="text-base list-decimal list-inside space-y-1">
        <li>Validates the order</li>
        <li>Generates an ID</li>
        <li>Publishes to queue</li>
        <li>Returns 201 Created</li>
      </ol>
    </div>
  </div>

  <div class="flex flex-col items-center justify-center gap-6">
    <div v-click class="text-8xl">⚡</div>
    <div v-click class="text-center p-4 bg-green-500 bg-opacity-20 rounded-lg border-2 border-green-400">
      <div class="text-base mb-1">Response Time</div>
      <div class="text-5xl font-bold text-green-400">50-80ms</div>
    </div>
  </div>
</div>

---
layout: default
---

# Component 3: Service Bus Queue

<div v-click class="text-center mb-1">
  <div class="text-2xl font-bold text-orange-400">
    🔒 Guaranteed Delivery Service
  </div>
  <div class="text-base text-gray-400">
    NEVER loses messages
  </div>
</div>

<div class="grid grid-cols-2 gap-2 mt-2">
  <div v-click class="p-2 bg-orange-500 bg-opacity-20 rounded border border-orange-400">
    <div class="text-base mb-0.5">💾 Persistence</div>
    <p class="text-xs">Persist until processed</p>
  </div>

  <div v-click class="p-2 bg-yellow-500 bg-opacity-20 rounded border border-yellow-400">
    <div class="text-base mb-0.5">🔄 Built-in Retry</div>
    <p class="text-xs">Up to 10 attempts</p>
  </div>

  <div v-click class="p-2 bg-red-500 bg-opacity-20 rounded border border-red-400">
    <div class="text-base mb-0.5">☠ Dead Letter Queue</div>
    <p class="text-xs">Failed message handling</p>
  </div>

  <div v-click class="p-2 bg-blue-500 bg-opacity-20 rounded border border-blue-400">
    <div class="text-base mb-0.5">📋 FIFO Ordering</div>
    <p class="text-xs">Sequential processing</p>
  </div>
</div>

<div v-click class="text-center mt-2 text-base text-green-400">
  ✅ Guaranteed processing
</div>

---
layout: default
---

# Component 4: Queue Processor

<div class="grid grid-cols-2 gap-8">
  <div>
    <div v-click class="mb-6">
      <h3 class="text-2xl text-purple-400 mb-3">🏢 The Back Office</h3>
      <p class="text-lg text-gray-300">
        Does the actual work • Automatically triggers when messages arrive
      </p>
    </div>
    <div v-click>
      <h3 class="text-xl text-blue-400 mb-2">Handles:</h3>
      <ul class="text-base space-y-1">
        <li>✅ Inventory checks</li>
        <li>✅ Payment processing</li>
        <li>✅ Confirmations</li>
        <li>✅ Status updates</li>
      </ul>
    </div>
  </div>

  <div class="flex flex-col items-center justify-center gap-6">
    <div v-click class="text-8xl">⚙️</div>
    <div v-click class="p-3 bg-purple-500 bg-opacity-20 rounded border-2 border-purple-400">
      <div class="text-base mb-1">If it fails?</div>
      <p class="text-sm">Message → Queue (auto retry)</p>
      <p class="text-sm mt-1">After 10 fails → Dead letter</p>
    </div>
  </div>
</div>

---
layout: default
---

# Component 5: Application Insights

<div class="grid grid-cols-2 gap-8">
  <div>
    <div v-click class="mb-4">
      <h3 class="text-xl text-cyan-400 mb-2">🔭 The Observatory</h3>
      <p class="text-base text-gray-300">
        Every operation is tracked
      </p>
    </div>
    <div v-click>
      <h3 class="text-lg text-blue-400 mb-1">Monitors:</h3>
      <ul class="text-sm space-y-0.5">
        <li>📊 Orders per second</li>
        <li>⏱ Processing times</li>
        <li>🚨 Error rates</li>
        <li>📈 Queue depth</li>
        <li>🔍 End-to-end tracing</li>
      </ul>
      <div class="text-gray-400 italic text-xs mt-3">
        Covered in Part 5
      </div>
    </div>
  </div>

  <div class="flex flex-col items-center justify-center">
    <div v-click class="text-7xl">📊</div>
  </div>
</div>

---
layout: center
---

# Complete Flow with Timing

```mermaid {theme: 'dark', scale: 0.5}
sequenceDiagram
    participant User
    participant HTTP as HTTP Function
    participant Queue as Service Bus
    participant Processor as Queue Processor
    participant Insights as App Insights

    User->>HTTP: Submit Order (0ms)
    HTTP->>HTTP: Validate & Publish (50ms)
    HTTP-->>User: 201 Success (80ms) ✅
    Note over User: User is happy!
    HTTP->>Queue: Store Message
    Queue->>Processor: Trigger Processing
    Processor->>Processor: Process Order (2-5s)
    HTTP->>Insights: Log Request
    Processor->>Insights: Log Processing
```

<div v-click class="text-center mt-4">
  <div class="text-2xl text-green-400">
    User waits <span class="text-4xl font-bold">80ms</span>
  </div>
  <div class="text-xl text-blue-400 mt-2">
    Processing happens in background
  </div>
  <div class="text-3xl text-purple-400 mt-2">
    ✨ That's the magic ✨
  </div>
</div>

---
layout: two-cols
---

# Service Bus vs Event Grid

<div v-click class="mb-4">

## The One Question Decision

<div class="text-2xl text-yellow-400 font-bold mt-2">
  "Can I afford to lose this message?"
</div>

</div>

<div v-click class="p-3 bg-blue-500 bg-opacity-20 rounded border border-blue-400 mb-3">

<div class="text-lg font-bold mb-1">Event Grid - Fire and Forget</div>

<div class="text-xs">

**Use for:**
- ⚡ Button clicks / analytics
- 📁 File notifications
- 🌡 IoT readings (1000s/sec)
- 📡 Telemetry

**Think:** "Hey, something happened"

</div>

</div>

::right::

<div v-click class="h-full flex flex-col justify-center pl-6">

<div class="p-3 bg-orange-500 bg-opacity-20 rounded border border-orange-400 mb-3">

<div class="text-lg font-bold mb-1">Service Bus - Guaranteed</div>

<div class="text-xs">

**Use for:**
- 🛒 **Orders** ✅ Cannot lose $10K order
- 💳 **Payments** - Must complete
- 🏦 **Financial** - Compliance
- 📦 **Inventory** - Must be accurate

**Think:** "MUST be processed"

</div>

</div>

<div v-click class="text-center">
  <div class="text-lg text-green-400 font-bold">
    For our order system:
  </div>
  <div class="text-sm text-gray-300 mt-1">
    We need guaranteed delivery, retry logic, dead letter queues, FIFO ordering
  </div>
  <div class="text-2xl text-orange-400 mt-2">
    → Service Bus
  </div>
</div>

</div>

---
layout: center
class: text-center
---

# Tech Stack & Universal Pattern

<div class="grid grid-cols-4 gap-3 mb-8">

<div v-click class="p-3 bg-green-500 bg-opacity-20 rounded border border-green-400">
<div class="text-lg font-bold mb-1">Azure Functions</div>
</div>

<div v-click class="p-3 bg-blue-500 bg-opacity-20 rounded border border-blue-400">
<div class="text-lg font-bold mb-1">TypeScript</div>
</div>

<div v-click class="p-3 bg-purple-500 bg-opacity-20 rounded border border-purple-400">
<div class="text-lg font-bold mb-1">Next.js</div>
</div>

<div v-click class="p-3 bg-orange-500 bg-opacity-20 rounded border border-orange-400">
<div class="text-lg font-bold mb-1">Bicep</div>
</div>

</div>

<div v-click class="mt-10">
  <div class="text-2xl text-yellow-400 mb-4">This pattern works everywhere</div>
  <div class="text-lg text-gray-300">Payment processing • Email campaigns • Data pipelines • Inventory • Notifications • Reports</div>
</div>

<div
  v-click
  v-motion
  :initial="{ scale: 0.8, opacity: 0 }"
  :enter="{ scale: 1, opacity: 1, transition: { delay: 300, duration: 600 } }"
  class="mt-8"
>

<div class="grid grid-cols-4 gap-3 text-center text-lg">
  <div class="p-4 bg-blue-500 bg-opacity-30 rounded-lg">
    <div class="text-4xl mb-1">1️⃣</div>
    <div class="text-sm">Accept fast</div>
  </div>

  <div class="p-4 bg-purple-500 bg-opacity-30 rounded-lg">
    <div class="text-4xl mb-1">2️⃣</div>
    <div class="text-sm">Queue reliably</div>
  </div>

  <div class="p-4 bg-green-500 bg-opacity-30 rounded-lg">
    <div class="text-4xl mb-1">3️⃣</div>
    <div class="text-sm">Process async</div>
  </div>

  <div class="p-4 bg-orange-500 bg-opacity-30 rounded-lg">
    <div class="text-4xl mb-1">4️⃣</div>
    <div class="text-sm">Monitor all</div>
  </div>
</div>

</div>

<div v-click class="mt-8 text-xl text-green-400">
  Build production systems in <span class="font-bold text-2xl">hours</span> instead of weeks 🚀
</div>

---
layout: center
---

# Series Roadmap

<div class="grid grid-cols-4 gap-4 mt-8">

<div class="p-4 bg-green-500 bg-opacity-30 rounded-lg border-2 border-green-400">
  <div class="text-3xl mb-2">✅</div>
  <div class="font-bold text-xl mb-2">Part 1</div>
  <div class="text-sm">Architecture</div>
</div>

<div v-click class="p-4 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-blue-400">
  <div class="text-3xl mb-2">2️⃣</div>
  <div class="font-bold text-xl mb-2">Part 2</div>
  <div class="text-sm">Deploy infrastructure with Bicep</div>
</div>

<div v-click class="p-4 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-blue-400">
  <div class="text-3xl mb-2">3️⃣</div>
  <div class="font-bold text-xl mb-2">Part 3</div>
  <div class="text-sm">Build HTTP Function</div>
</div>

<div v-click class="p-4 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-blue-400">
  <div class="text-3xl mb-2">4️⃣</div>
  <div class="font-bold text-xl mb-2">Part 4</div>
  <div class="text-sm">Queue Processor with retry logic</div>
</div>

<div v-click class="p-4 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-blue-400">
  <div class="text-3xl mb-2">5️⃣</div>
  <div class="font-bold text-xl mb-2">Part 5</div>
  <div class="text-sm">Monitoring and dashboards</div>
</div>

<div v-click class="p-4 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-blue-400">
  <div class="text-3xl mb-2">6️⃣</div>
  <div class="font-bold text-xl mb-2">Part 6</div>
  <div class="text-sm">Next.js frontend setup</div>
</div>

<div v-click class="p-4 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-blue-400">
  <div class="text-3xl mb-2">7️⃣</div>
  <div class="font-bold text-xl mb-2">Part 7</div>
  <div class="text-sm">Complete UI integration</div>
</div>

<div v-click class="p-4 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-blue-400">
  <div class="text-3xl mb-2">8️⃣</div>
  <div class="font-bold text-xl mb-2">Part 8</div>
  <div class="text-sm">CI/CD automation</div>
</div>

</div>

<div v-click class="text-center mt-12 text-2xl text-gray-400">
  Each video builds on the last • By Part 8, you'll have a production-ready system
</div>

---
layout: default
---

# Prerequisites Setup

<div class="text-center mb-4">
  <div class="text-2xl text-yellow-400 mb-1">Set This Up Before Part 2</div>
  <div class="text-base text-gray-400">Total setup time: ~15 minutes • Everything is free tier</div>
</div>

<div class="grid grid-cols-2 gap-3 mt-4">

<div v-click class="p-3 bg-blue-500 bg-opacity-20 rounded border-2 border-blue-400">
  <div class="text-lg mb-1">☁ Azure Account</div>
  <a href="https://azure.com/free" class="text-blue-300 underline text-sm">azure.com/free</a>
  <p class="text-xs text-gray-400 mt-1">Free tier includes everything we need</p>
</div>

<div v-click class="p-3 bg-green-500 bg-opacity-20 rounded border-2 border-green-400">
  <div class="text-lg mb-1">⚡ Node.js 20</div>
  <a href="https://nodejs.org" class="text-green-300 underline text-sm">nodejs.org</a>
  <p class="text-xs text-gray-400 mt-1">Required for Next.js and Functions</p>
</div>

<div v-click class="p-3 bg-purple-500 bg-opacity-20 rounded border-2 border-purple-400">
  <div class="text-lg mb-1">🛠 Azure CLI</div>
  <a href="https://learn.microsoft.com/cli/azure/install-azure-cli" class="text-purple-300 underline text-sm">Install Guide</a>
  <p class="text-xs text-gray-400 mt-1">Deploy infrastructure from terminal</p>
</div>

<div v-click class="p-3 bg-orange-500 bg-opacity-20 rounded border-2 border-orange-400">
  <div class="text-lg mb-1">⚙ Azure Functions Core Tools</div>
  <a href="https://learn.microsoft.com/azure/azure-functions/functions-run-local" class="text-orange-300 underline text-sm">Install Guide</a>
  <p class="text-xs text-gray-400 mt-1">Local development and testing</p>
</div>

</div>

<div v-click class="text-center mt-4">
  <div class="text-base text-blue-400">💡 Recommended: VS Code with Azure Extensions</div>
</div>

---
layout: center
class: text-center
---

# Coming Next

<div
  v-motion
  :initial="{ scale: 0.5, opacity: 0 }"
  :enter="{ scale: 1, opacity: 1, transition: { duration: 800 } }"
  class="mt-12 p-12 bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-30 rounded-2xl border-4 border-blue-400"
>
  <div class="text-5xl font-bold mb-6">Part 2</div>
  <div class="text-3xl mb-4">Deploy Infrastructure with Bicep</div>
  <div class="text-xl text-gray-300">One command • Full Azure environment</div>
</div>

<div v-click class="mt-12 text-2xl text-blue-400">
  🔔 <span class="font-bold">Subscribe to get notified when it's live</span>
</div>

<div v-click class="mt-6 text-3xl text-green-400">
  See you there! Happy building! 🚀
</div>
