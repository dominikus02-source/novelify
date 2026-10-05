#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/novelify/apps/novelify}"
CONFIG_DIR="${NOVELIFY_CONFIG_DIR:-/opt/novelify/config}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

exec 9>/tmp/novelify-deploy.lock
if ! flock -n 9; then
  echo "Another Novelify deploy is already running" >&2
  exit 1
fi

cd "$REPO_DIR"
git fetch --prune origin
git checkout "$DEPLOY_BRANCH"
git pull --ff-only origin "$DEPLOY_BRANCH"

cd ops/vps
COMPOSE=(docker compose)

echo "==> Build Novelify"
DOCKER_BUILDKIT=1 "${COMPOSE[@]}" build web

echo "==> Start Novelify"
"${COMPOSE[@]}" up -d web

echo "==> Wait for health"
for i in {1..40}; do
  if curl -fsSI --max-time 5 http://127.0.0.1:3010/ >/dev/null; then
    echo "Novelify health OK"
    break
  fi
  if [[ "$i" -eq 40 ]]; then
    "${COMPOSE[@]}" ps
    exit 1
  fi
  sleep 3
done

"${COMPOSE[@]}" ps
docker builder prune -af --filter until=168h >/dev/null || true
echo "==> Novelify deploy complete"
