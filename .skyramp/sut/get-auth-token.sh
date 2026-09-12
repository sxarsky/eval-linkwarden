#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://localhost:3000"
USERNAME="testbot-admin"
PASSWORD="testbotpassword123"

# 1. Create test user (ignore 400 = user already exists)
curl -sf -X POST "${BASE_URL}/api/v1/users" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"${USERNAME}\", \"password\": \"${PASSWORD}\", \"name\": \"Testbot Admin\"}" \
  >/dev/null 2>&1 || true

# 2. Get CSRF token AND save its cookie (both are required for the sign-in POST)
COOKIE_JAR=$(mktemp)
CSRF_TOKEN=$(curl -sf -c "${COOKIE_JAR}" "${BASE_URL}/api/v1/auth/csrf" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])")

if [ -z "${CSRF_TOKEN}" ]; then
  rm -f "${COOKIE_JAR}"
  echo "Failed to get CSRF token" >&2
  exit 1
fi

# 3. Sign in with credentials provider (send both CSRF cookie and token)
curl -sf -c "${COOKIE_JAR}" -b "${COOKIE_JAR}" -L \
  -X POST "${BASE_URL}/api/v1/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${USERNAME}&password=${PASSWORD}&csrfToken=${CSRF_TOKEN}&callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F" \
  -o /dev/null

# 4. Extract next-auth session token (works as Bearer per next-auth v4 getToken())
SESSION_TOKEN=$(awk '/next-auth\.session-token/{print $NF}' "${COOKIE_JAR}")
rm -f "${COOKIE_JAR}"

if [ -z "${SESSION_TOKEN}" ]; then
  echo "Authentication failed: no session token found" >&2
  exit 1
fi

echo "${SESSION_TOKEN}"