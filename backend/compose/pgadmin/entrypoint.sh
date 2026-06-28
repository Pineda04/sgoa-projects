#!/bin/bash

set -e

export PGADMIN_SERVER_JSON_FILE="${PGADMIN_SERVER_JSON_FILE:-/var/lib/pgadmin/servers.json}"

cat > "$PGADMIN_SERVER_JSON_FILE" <<EOF
{
  "Servers": {
    "1": {
      "Name": "SGOA-DB",
      "Group": "Servers",
      "Host": "postgres",
      "Port": 5432,
      "MaintenanceDB": "${POSTGRES_DB}",
      "Username": "${POSTGRES_USER}",
      "Password": "${POSTGRES_PASSWORD}",
      "SSLMode": "prefer"
    }
  }
}
EOF

exec /entrypoint.sh "$@"
