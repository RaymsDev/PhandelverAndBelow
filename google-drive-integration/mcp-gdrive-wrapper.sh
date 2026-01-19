#!/bin/bash
# Wrapper script for mcp-google-drive to read service account from file

# Source nvm if available (needed for non-interactive shells)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 2>/dev/null

SERVICE_ACCOUNT_FILE="${GOOGLE_SERVICE_ACCOUNT_KEY_FILE:-/home/rayms/repos/PhandelverAndBelow/google-drive-integration/credentials/service-account.json}"

if [ ! -f "$SERVICE_ACCOUNT_FILE" ]; then
    echo "Error: Service account file not found at $SERVICE_ACCOUNT_FILE" >&2
    exit 1
fi

# Export the file path (not the content)
export GOOGLE_SERVICE_ACCOUNT_KEY_FILE="$SERVICE_ACCOUNT_FILE"

# Suppress nvm output and run mcp-google-drive
exec npx -y mcp-google-drive 2>/dev/null
