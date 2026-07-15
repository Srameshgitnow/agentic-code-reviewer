#!/bin/bash

# Install dependencies
npm install

# Create .env file from example
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file. Please update it with your configuration."
fi

# Run TypeScript compiler
npm run build

echo "Setup complete! Run 'npm start' to begin."
