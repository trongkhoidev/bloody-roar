#!/bin/bash

echo "Starting to clear ports..."

# Clear backend port (3000)
BE_PID=$(lsof -ti:3000)
if [ ! -z "$BE_PID" ]; then
    echo "Killing backend process on port 3000 (PID: $BE_PID)"
    kill -9 $BE_PID
else
    echo "Port 3000 is already clear."
fi

# Clear frontend port (5173)
FE_PID=$(lsof -ti:5173)
if [ ! -z "$FE_PID" ]; then
    echo "Killing frontend process on port 5173 (PID: $FE_PID)"
    kill -9 $FE_PID
else
    echo "Port 5173 is already clear."
fi

# Clear documentation port (5174)
DOC_PID=$(lsof -ti:5174)
if [ ! -z "$DOC_PID" ]; then
    echo "Killing documentation process on port 5174 (PID: $DOC_PID)"
    kill -9 $DOC_PID
else
    echo "Port 5174 is already clear."
fi

# Clear hardhat node port (8545)
HH_PID=$(lsof -ti:8545)
if [ ! -z "$HH_PID" ]; then
    echo "Killing hardhat process on port 8545 (PID: $HH_PID)"
    kill -9 $HH_PID
else
    echo "Port 8545 is already clear."
fi

echo "Ports cleared. Starting background services..."

# Start Hardhat local node in background
echo "🚀 Starting Hardhat local node on port 8545..."
(cd apps/blockchain && npx hardhat node > hardhat_node.log 2>&1) &

# Start Documentation site in background
echo "📚 Starting Documentation dev server on port 5174..."
(cd apps/api/documentation && npx vite --port 5174 > documentation_dev.log 2>&1) &

echo "Starting applications..."

# Run both backend and frontend using the dev script in package.json
pnpm run dev
