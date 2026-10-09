# Walkthrough: Fix WebGL/WebGPU Constants Error

I have implemented a fix for the `Uncaught TypeError: Cannot read properties of undefined (reading 'VERTEX')` error that occurred when selecting a project. This error was caused by a mismatch between the very recent Three.js v0.182.0 and its dependent libraries (like `three-render-objects`), which were attempting to access WebGPU constants that might be undefined in certain environments.

## Changes

### 1. WebGPU Polyfill

- Created `src/lib/webgpu-polyfill.ts` which provides a safe set of defaults for `GPUShaderStage` and `GPUBufferUsage`. This ensures that even if the browser doesn't support WebGPU or the library does an eager check, the application won't crash.

### 2. Global Integration

- Imported the polyfill in `src/app/layout.tsx` to ensure it's active application-wide from the very first module evaluation.

### 3. Graph Component Stability

- Added the polyfill import to `src/components/graph/graph-scene.tsx` as an extra layer of protection.
- Enhanced the `ScreenshotHandler` to gracefully handle cases where the WebGL renderer or its components might be null or undefined (e.g., during context loss).

## Verification Result

The app no longer crashes during module evaluation when navigating to a project page. The `VERTEX` error is resolved by the polyfill.
