#!/bin/bash
# Wrapper script for mcp-google-drive to read service account from file

SERVICE_ACCOUNT_FILE="${GOOGLE_SERVICE_ACCOUNT_KEY_FILE:-/home/remy.laffuge/repos/PhandelverAndBelow/google-drive-integration/credentials/service-account.json}"

if [ ! -f "$SERVICE_ACCOUNT_FILE" ]; then
    echo "Error: Service account file not found at $SERVICE_ACCOUNT_FILE" >&2
    exit 1
fi

# Read the service account JSON and export it
export GOOGLE_SERVICE_ACCOUNT_KEY=$(cat "$SERVICE_ACCOUNT_FILE")

# Run mcp-google-drive
exec npx -y mcp-google-drive
