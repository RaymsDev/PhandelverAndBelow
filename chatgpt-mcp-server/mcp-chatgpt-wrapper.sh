#!/bin/bash

# ChatGPT MCP Server Wrapper
# Ensures the server has access to environment variables and runs with correct Node version

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source nvm if available (for non-interactive shells)
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
fi

# Change to script directory
cd "$SCRIPT_DIR"

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Run the MCP server
exec node src/index.js
