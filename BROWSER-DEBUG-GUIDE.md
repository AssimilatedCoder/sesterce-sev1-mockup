# Browser Debug Guide for Black Screen Issue

## Immediate Steps When Black Screen Occurs

### 1. Open Browser Developer Tools
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Safari**: Press `Cmd+Option+I` (Mac) - Enable Developer menu first in Preferences

### 2. Check Console Tab
Look for these types of errors:

#### JavaScript Errors
```
Uncaught TypeError: Cannot read property 'X' of undefined
Uncaught ReferenceError: X is not defined
Uncaught Error: Maximum call stack size exceeded (infinite loop)
```

#### React Errors
```
Warning: Cannot update a component while rendering a different component
Warning: Maximum update depth exceeded
Error: Minified React error #130
```

#### Memory Issues
```
Uncaught RangeError: Maximum call stack size exceeded
Out of memory
```

### 3. Check Network Tab
Look for:
- **Failed requests** (red status codes: 404, 500, etc.)
- **Pending requests** that never complete
- **Large response sizes** that might cause memory issues
- **API calls** that are failing or timing out

### 4. Check Memory Tab (Chrome)
1. Go to **Memory** tab
2. Take a **Heap snapshot**
3. Look for:
   - Large objects consuming memory
   - Increasing memory usage over time
   - Detached DOM nodes

### 5. Check Performance Tab
1. Click **Record** button
2. Use the app normally until black screen occurs
3. Stop recording
4. Look for:
   - Long-running tasks
   - Memory leaks
   - Excessive re-renders

## Common Patterns to Look For

### 1. Infinite Re-render Loop
**Console Error**: "Maximum update depth exceeded"
**Cause**: useEffect or useState causing infinite updates
**Location**: Usually in React components with dependency arrays

### 2. Memory Leak
**Symptoms**: 
- Memory usage increases over time
- Browser becomes sluggish
- Eventually crashes or goes black

**Common Causes**:
- Event listeners not cleaned up
- Timers (setInterval/setTimeout) not cleared
- Large objects held in state
- Circular references

### 3. Unhandled Promise Rejections
**Console Error**: "Uncaught (in promise)"
**Cause**: API calls or async operations failing without proper error handling

### 4. State Corruption
**Symptoms**: 
- Components render incorrectly
- Blank screens
- Unexpected behavior

**Cause**: Invalid state updates or corrupted data

## Specific Areas to Check in NullSector App

### 1. Calculator Tab (CalculatorTabRedesigned.tsx)
- Large useEffect dependencies
- Complex state updates
- Storage tier calculations
- Service tier configurations

### 2. Location Selector
- Large dropdown lists
- Search functionality
- Currency conversion calculations

### 3. Storage Override Section
- Slider interactions
- Dynamic PB calculations
- Tier distribution logic

### 4. Infrastructure Configuration
- Complex form interactions
- Nested object updates
- Validation logic

## How to Capture and Save Debug Information

### 1. Save Console Output
1. Right-click in Console tab
2. Select "Save as..." or "Copy all"
3. Save to a text file with timestamp

### 2. Export Network Activity
1. In Network tab, right-click on any request
2. Select "Save all as HAR with content"
3. Save the .har file for analysis

### 3. Take Screenshots
- Screenshot of Console errors
- Screenshot of Network failures
- Screenshot of Memory usage

### 4. Record Performance Profile
1. In Performance tab, click Record
2. Reproduce the issue
3. Stop recording
4. Save the profile for analysis

## Quick Fixes to Try

### 1. Hard Refresh
- **Chrome/Firefox**: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
- **Safari**: `Cmd+R` while holding Shift

### 2. Clear Browser Cache
- **Chrome**: Settings → Privacy → Clear browsing data
- **Firefox**: Settings → Privacy → Clear Data
- **Safari**: Develop → Empty Caches

### 3. Disable Browser Extensions
- Try in Incognito/Private mode
- Disable ad blockers or other extensions

### 4. Try Different Browser
- Test in Chrome, Firefox, Safari, Edge
- Check if issue is browser-specific

## Reporting the Issue

When reporting, include:

1. **Browser and version**
2. **Operating system**
3. **Steps to reproduce**
4. **Console errors** (copy/paste full text)
5. **Network failures** (if any)
6. **Time when issue occurred**
7. **What you were doing** when it happened

## Emergency Recovery

If the app is completely unresponsive:

1. **Force refresh**: `Ctrl+F5` or `Cmd+Shift+R`
2. **Clear browser data**: Clear cache and cookies for localhost:2053
3. **Restart browser**: Close and reopen browser
4. **Check server**: Run `./quick-frontend-check.sh`
5. **Restart containers**: Run `./deploy-docker.sh`

## Advanced Debugging

### Enable React DevTools
1. Install React Developer Tools browser extension
2. Open DevTools → React tab
3. Monitor component re-renders
4. Check for performance issues

### Enable Verbose Logging
Add to browser console:
```javascript
// Enable React warnings
localStorage.setItem('debug', 'react*');

// Monitor all network requests
window.addEventListener('beforeunload', () => {
  console.log('Page unloading - check for cleanup issues');
});
```

### Monitor Memory Usage
```javascript
// Check memory usage
console.log('Memory usage:', performance.memory);

// Monitor over time
setInterval(() => {
  console.log('Memory:', performance.memory.usedJSHeapSize / 1024 / 1024, 'MB');
}, 5000);
```
