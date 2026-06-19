# CausalFunnel User Analytics Application

A full-stack application that tracks user interactions on a webpage and displays them in a dashboard. Built as an assignment for the Full Stack Engineer role at CausalFunnel.

## Tech Stack

*   **Frontend (Dashboard):** Next.js (App Router), React, Tailwind CSS
*   **Backend (API):** Node.js, Express.js
*   **Database:** MongoDB
*   **Tracking Script:** Vanilla JavaScript

## Project Structure

*   `/backend` - Express server and MongoDB models
*   `/frontend` - Next.js Dashboard application
*   `/demo` - HTML page with the tracking script to generate data

## Setup Steps

### Prerequisites
*   Node.js (v18+)
*   MongoDB running locally on default port `27017` (or modify `MONGO_URI` in backend code)

### 1. Start the Backend API
```bash
cd backend
npm install
npm start
# Server will run on http://localhost:5000
```

### 2. Start the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
# Dashboard will run on http://localhost:3000
```

### 3. Generate Analytics Data
Open `/demo/index.html` in your web browser. 
Interact with the page by clicking around. The tracking script will send `page_view` and `click` events to the backend.

### 4. View Dashboard
Navigate to `http://localhost:3000` in your browser.
*   **Sessions View:** See active sessions and click on them to view the user's event journey.
*   **Heatmap View:** Select a page to see the absolute click coordinates visually represented.

## Assumptions & Trade-offs

1.  **Session Tracking:** `localStorage` is used to store `session_id`. It persists across tabs and window reloads. An alternative would be `sessionStorage` (lost on tab close) or cookies (better for cross-domain if configured correctly, but `localStorage` is simpler for a demo).
2.  **Heatmap Visualization:** The heatmap plots dots using absolute X and Y coordinates on a large blank canvas. In a production app, this would overlay over an `iframe` of the target site or a scaled screenshot, and handle responsive design resizing logic (normalizing coordinates to percentages or screen widths).
3.  **Database Connection:** Assumes a local, unauthenticated MongoDB instance running at `mongodb://127.0.0.1:27017/causalfunnel_analytics`.
4.  **CORS:** The Express backend uses the `cors` package to allow requests from any origin for ease of local testing with the file `file://` protocol in the demo script.
5.  **Beacon vs Fetch:** The tracking script attempts to use `navigator.sendBeacon` if available, which is best practice for analytics to ensure data is sent even if the user navigates away. It falls back to `fetch` with `keepalive`.
