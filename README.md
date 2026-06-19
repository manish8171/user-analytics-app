# CausalFunnel - Full-Stack User Analytics Platform

A sleek, premium, and fully-featured User Analytics Platform designed to track, aggregate, and visualize user interactions (page views and clicks) in real-time. Built with a modern dark-mode aesthetic and zero-configuration backend, it provides actionable insights into how users navigate and engage with your web applications.

## 🌟 Key Features

* **Real-time Interaction Tracking**: A lightweight vanilla JavaScript tracker (`tracking.js`) that captures precise X/Y click coordinates, target element text, and page view timestamps without blocking the main thread.
* **Sleek Dark Mode Dashboard**: A spectacular Next.js frontend featuring glassmorphism (`backdrop-filter`), glowing neon timelines, ambient gradients, and fluid micro-animations.
* **Actionable Click Analytics**: Automatically aggregates raw click coordinates into an intuitive "Most Clicked Elements" leaderboard, allowing you to easily identify high-converting UI components.
* **Complete Session Management**: Track full user journeys across multiple pages. Built-in tools allow administrators to instantly **End**, **Block**, or **Delete** malicious or stale sessions.
* **Zero-Config Backend**: A robust Node.js/Express backend powered by a highly-efficient In-Memory Array Database. It bypasses complex Linux/OS binary constraints, guaranteeing immediate startup on any machine without requiring a local MongoDB installation.
* **Automated Startup**: Comes with a resilient `start.sh` script that automatically installs dependencies, handles port management, and launches both the frontend dashboard and demo tracking page in parallel.

## 🚀 Getting Started

1. Clone this repository.
2. Ensure you have Node.js installed.
3. Run the automated startup script:
   ```bash
   ./start.sh
   ```
4. Click around the **Demo Page** to generate tracking data.
5. Open the **Dashboard** to view your real-time analytics!

## 🛠 Tech Stack

* **Frontend Dashboard**: Next.js (App Router), React, Tailwind CSS
* **Backend API**: Node.js, Express, CORS
* **Tracking Client**: Vanilla JavaScript (`fetch` with Keepalive logic to bypass CORS constraints)
* **Database**: Pure JS In-Memory Fallback (Originally Mongoose/MongoDB)
# user-analytics-app
# user-analytics-app
