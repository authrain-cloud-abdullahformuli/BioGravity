# Fix Docker Build Error: public directory not found

## Description of Changes

While deploying to the NAS using Portainer with a repository stack, the `docker compose build` operation failed with the error:
`failed to compute cache key: failed to calculate checksum of ref ... "/app/public": not found`

This error occurs during the Next.js Dockerfile build phase `COPY --from=builder /app/public ./public` because Git does not track empty directories. If the `public` folder is empty, it won't be committed to the branch correctly, so when Portainer pulls the repository, the `public` directory doesn't exist in the context context.

To resolve this issue, an empty `.gitkeep` file was added into the `public/` directory so Git starts tracking it, ensuring the folder is present in the Portainer build.

## Printscreens

*No visual changes were made.*

## Testing Table

| Test Category   | Test Case | Status | Notes |
| :--- | :--- | :--- | :--- |
| **System** | Build process | 🟡 Pending | The deployment needs to be pushed to the repository and rebuilt in Portainer. |
