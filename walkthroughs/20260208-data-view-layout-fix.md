# Data View Layout Fix

**Date:** 2026-02-08

## Problem

The Elements and Relationships tabs in the Data View were being pushed off-screen when the table contained many rows. The table was expanding beyond the viewport instead of scrolling internally.

_(screenshot no longer retained)_

## Solution

Applied CSS flexbox height constraints to ensure the table container scrolls internally while keeping the tabs always visible.

### Changes Made

#### 1. `src/app/projects/[id]/page.tsx`

```diff
-<main className="flex-1 relative overflow-hidden flex flex-col">
-    <Tabs defaultValue="graph" className="flex-1 flex flex-col">
+<main className="flex-1 relative overflow-hidden flex flex-col min-h-0">
+    <Tabs defaultValue="graph" className="flex-1 flex flex-col min-h-0">
```

```diff
-<TabsContent value="data" className="flex-1 relative m-0 data-[state=inactive]:hidden overflow-auto bg-muted/10">
+<TabsContent value="data" className="flex-1 relative m-0 data-[state=inactive]:hidden overflow-hidden bg-muted/10 min-h-0 h-full">
```

#### 2. `src/components/projects/data-view.tsx`

```diff
-<div className="flex flex-col h-full bg-background overflow-hidden">
+<div className="flex flex-col h-full bg-background overflow-hidden min-h-0">
```

## Technical Explanation

The key fix was adding `min-h-0` to flex containers. In CSS flexbox, flex items have a default `min-height: auto` which prevents them from shrinking below their content size. By setting `min-h-0`, we allow the flex items to shrink as needed, enabling the proper overflow/scroll behavior.

### Why `min-h-0`?

- In a nested flex column layout, each flex child needs `min-h-0` to allow shrinking
- Without it, `overflow: auto/hidden` on children won't work as expected
- The content pushes the container height instead of triggering scroll

## Verification

The fix was applied while the Docker container was running on port 3010. Authentication prevented automated visual verification, but the CSS changes follow the correct pattern for fixing this type of flexbox overflow issue.

### Expected Behavior After Fix

1. The Elements/Relationships tabs at the bottom remain **always visible**
2. The table content scrolls internally when data exceeds available height
3. The layout properly fills the available viewport space

## Files Modified

- [page.tsx](../src/app/projects/[id]/page.tsx)
- [data-view.tsx](../src/components/projects/data-view.tsx)
