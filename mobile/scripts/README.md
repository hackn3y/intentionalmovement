# Screenshot Utility

Automated screenshot tool using Puppeteer for capturing the Expo web app.

## Installation

Puppeteer is already installed as a dev dependency:

```bash
npm install --save-dev puppeteer
```

## Usage

### Quick Screenshot

Take a screenshot of the current running app (defaults to localhost:8091):

```bash
npm run screenshot
```

### Custom URL and Output

```bash
# Specify URL and output path
node scripts/screenshot.js <url> <output-path>

# Examples:
node scripts/screenshot.js http://localhost:8091 screenshots/home.png
node scripts/screenshot.js http://localhost:8091/profile screenshots/profile.png
```

### Pre-configured Scripts

```bash
# Screenshot the home page
npm run screenshot:home

# Screenshot the profile page
npm run screenshot:profile
```

## Programmatic Usage

You can also use the screenshot utility in your own Node.js scripts:

```javascript
const { takeScreenshot } = require('./scripts/screenshot');

// Basic usage
await takeScreenshot('http://localhost:8091', 'output.png');

// With options
await takeScreenshot('http://localhost:8091', 'output.png', {
  viewport: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2,
  },
  delay: 2000, // Wait 2 seconds before screenshot
  fullPage: true, // Capture entire page
});
```

## Options

### Viewport

The default viewport is set to iPhone dimensions (375x812):

```javascript
{
  width: 375,
  height: 812,
  deviceScaleFactor: 2,
}
```

You can customize this by modifying the `DEFAULT_VIEWPORT` in `screenshot.js`.

### Delay

By default, the script waits 1 second after page load before taking the screenshot. This gives time for animations and rendering. Adjust the `delay` option if needed.

### Full Page

Set `fullPage: true` to capture the entire scrollable page instead of just the viewport.

## Troubleshooting

### Chrome/Chromium Not Found

Puppeteer downloads Chromium automatically. If you encounter issues, ensure you have sufficient disk space and network connectivity.

### Port Not Available

Make sure your Expo web app is running on the specified port:

```bash
cd mobile && npx expo start --web --port 8091
```

### Screenshots Directory

Screenshots are saved to `mobile/screenshots/` by default. The directory is created automatically if it doesn't exist.

## Use Cases

- Visual regression testing
- Documentation screenshots
- Debugging layout issues
- Sharing progress with team
- Automated visual testing in CI/CD
