# GitHub Release Workflow

This document describes the GitHub Actions workflow for releasing the Garage UI project.

## How to Create a Release

1. Create a new tag following semantic versioning and push it to GitHub:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. The workflow will automatically create a GitHub release and build everything

## What the Workflow Does

When a new tag is pushed, the workflow will:

1. Extract the version from the tag (e.g., v1.0.0 becomes 1.0.0)
2. Build the Docker image and push it to GitHub Container Registry with appropriate version tags
3. Build binaries for various platforms (Linux with architectures: 386, amd64, arm, arm64) using the tag version
4. Create a GitHub release and attach the binaries as assets

## Docker Images

The Docker images will be available at:
- `ghcr.io/khairul169/garage-webui:latest`
- `ghcr.io/khairul169/garage-webui:X.Y.Z` (version tag)
- `ghcr.io/khairul169/garage-webui:X.Y` (major.minor tag)

## Binaries

The binaries will be attached to the GitHub release and can be downloaded directly from the release page.

## Configuration

If you want to also push Docker images to Docker Hub, uncomment and configure the Docker Hub login section in the workflow file and add the following secrets to your repository:

- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Your Docker Hub access token
