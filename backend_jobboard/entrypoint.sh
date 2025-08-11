#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# Path to the database file within the container
DB_FILE="/app/db/database.db"

# Check if the database file already exists in the volume
if [ ! -f "$DB_FILE" ]; then
  echo "Database not found at $DB_FILE. Initializing..."
  # Run the Node.js initialization script
  # We use `node` directly since it's in the PATH
  node /app/db/init.js
else
  echo "Database already exists. Skipping initialization."
fi

# Execute the main command (passed as arguments to this script)
# This will be `CMD ["node", "server.js"]` from the Dockerfile
exec "$@"
