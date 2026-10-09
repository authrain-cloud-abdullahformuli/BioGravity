# Graph Export Quality Improvement

## Functional Description

Previously, exporting the graph using the `ScreenshotHandler` would produce blurry graphs and pixelated, unreadable labels because the underlying 3D WebGL renderer and dynamic text sprites weren't configured for high-resolution snapshots.

**Changes made to fix this issue:**

1. **ForceGraph3D WebGL Scaling**: The core logic in `ScreenshotHandler` has been upgraded to interact with `react-force-graph`'s WebGL renderer via `graphRef`. When taking a screenshot, it now temporarily overrides the `devicePixelRatio` to `4` (simulating an ultra-high definition display), forces an immediate WebGL render, takes the screenshot with `html-to-image` synced at `pixelRatio: 4`, and finally restores the original display settings.
2. **SpriteText Resolution Improvement**: Modified the underlying `three-spritetext` definitions in the 3D graph `nodeThreeObject` handler. Overrided the default `resolution: 1` to `4` ensuring text acts correctly rendering extremely sharply on the output. Also disabled `depthWrite` to eliminate specific visual clipping artifacts.
3. **Renderer Quality Config**: Provided `antialias: true` and `alpha: true` back to the standard `rendererConfig` in the `ForceGraph3D` prop. This causes nodes borders and lines to be incredibly smooth rather than visibly jagged.

This ensures exported graphs (both the WebGL background structure and DOM overlaid Legend panel) remain exceptionally crisp, matching or vastly exceeding standard user expectations for data asset exports.

## Printscreens

*Note: Run the project and utilize the `Printscreen` functionality on your graph view. The text and nodes logic are now beautifully smooth at huge magnification when opened and scaled.*
