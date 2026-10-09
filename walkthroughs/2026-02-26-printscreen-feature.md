# Walkthrough - Printscreen Feature

I have replaced the "Share" button with a "Printscreen" button that captures a high-resolution image of the graph and its legend.

## Changes Made

### 1. Printscreen Button

- Replaced the generic "Share" button in the project header with a "Printscreen" button using a Camera icon.
- This button triggers a state change in the graph store.

### 2. High-Resolution Capture

- Implemented `ScreenshotHandler` in `GraphScene.tsx`.
- Uses `html2canvas` to capture the `.graph-container` element, which includes the 3D graph and the legend.
- Set `scale: 2` in the capture options to ensure high resolution.
- Added `preserveDrawingBuffer: true` to the WebGL renderer config to allow capturing the buffer.

### 3. Legend Inclusion

- Since the legend is a child of the `graph-container`, it is automatically included in the capture.

## Verification Results

### Manual Test Steps

1. Navigate to a project page.
2. Click the **Printscreen** button in the top right header.
3. Observe that a `.png` file is downloaded (e.g., `biogravity-graph-2026-02-26-07-15-30.png`).
4. Open the image and verify it contains both the graph and the legend.

## Technical Details

- **Library**: `html2canvas` (added to dependencies).
- **Trigger**: `useGraphStore.triggerScreenshot` -> `useEffect` in `GraphScene`.
- **Resolution**: Scaled by 2x for better print/presentation quality.
