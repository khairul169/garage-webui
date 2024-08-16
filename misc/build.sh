#!/bin/sh

set -e

IMAGE_NAME="khairul169/garage-webui"
PACKAGE_VERSION=$(cat package.json | grep \"version\" | cut -d'"' -f 4)

echo "Building version $PACKAGE_VERSION"

docker buildx build --platform linux/amd64,linux/arm64 \
 -t "$IMAGE_NAME:latest" -t "$IMAGE_NAME:$PACKAGE_VERSION" --push .
