#!/bin/bash

# Navigate to the directory where the script is located
cd "$(dirname "$0")" || exit 1

echo "Starting CausalFunnel Analytics..."

# Start Backend in the background
echo "-> Starting Backend API (Port 5000)..."
cd backend
[ ! -d "node_modules" ] && echo "Installing backend dependencies..." && npm install --silent
npm start &
BACKEND_PID=$!
cd ..

# Wait a second for backend to initialize
sleep 2

# Start Frontend
echo "-> Starting Frontend Dashboard (Port 3000)..."
cd frontend
[ ! -d "node_modules" ] && echo "Installing frontend dependencies..." && npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ..

# Handle shutdown gracefully
trap "echo -e '\nShutting down servers...'; kill $BACKEND_PID 2>/dev/null; kill $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

echo ""
echo "=========================================================="
echo "🚀 Application is running!"
echo "Dashboard: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo "Demo Page: Open /demo/index.html in your browser"
echo "=========================================================="
echo "Press Ctrl+C to stop both servers."

# Wait a few seconds for servers to start, then open Chrome
(
  sleep 4
  echo "-> Opening browser..."
  xdg-open "http://localhost:3000" 2>/dev/null &
  sleep 1
  xdg-open "$PWD/demo/index.html" 2>/dev/null &
) &

# Wait for background processes
wait
