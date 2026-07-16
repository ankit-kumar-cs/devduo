REDIS_PORT=${REDIS_PORT:-6379}
echo "PORT: ${REDIS_PORT}"
redis-server --port "${REDIS_PORT}"