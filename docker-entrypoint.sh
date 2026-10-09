#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Running database migrations with Prisma v5.13.0..."
prisma migrate deploy

echo "Starting server..."
exec npm start
