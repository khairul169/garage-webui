#!/bin/sh

set -e

BINARY=garage-webui
VERSION=$(cat package.json | grep \"version\" | cut -d'"' -f 4)
PLATFORMS="linux"
ARCHITECTURES="386 amd64 arm arm64"

echo "Building version $VERSION"

npm run build
cd backend && rm -rf dist && mkdir -p dist && rm -rf ./ui/dist && cp -r ../dist ./ui/dist

for PLATFORM in $PLATFORMS; do
    for ARCH in $ARCHITECTURES; do
        echo "Building $PLATFORM-$ARCH"

        GOOS=$PLATFORM GOARCH=$ARCH go build -o "dist/$BINARY-v$VERSION-$PLATFORM-$ARCH" -tags="prod" main.go
    done
done
