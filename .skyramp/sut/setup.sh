#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="${REPO_ROOT}/.skyramp/sut/docker-compose.testbot.yml"

# Prune stale Docker state to prevent disk exhaustion on retries
docker system prune -f --volumes 2>/dev/null || true

# Start SUT containers (image already built by GHA pre-step)
docker compose -f "${COMPOSE_FILE}" --project-directory "${REPO_ROOT}" up -d

# Install Node.js deps and Playwright browsers for the e2e suite
cd "${REPO_ROOT}"

# Ensure Yarn 4 is active (corepack may not persist across steps)
if ! command -v corepack &>/dev/null; then
  npm install -g corepack
fi
corepack enable 2>/dev/null || true
corepack prepare yarn@4.12.0 --activate 2>/dev/null || true

yarn install --immutable

# Install Playwright with Chromium and its system dependencies
yarn workspace @linkwarden/web exec npx playwright install --with-deps chromium