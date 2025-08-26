# Fonts Directory

This directory is for storing custom font files used in the Rain Observer application.

## Supported Formats

- WOFF2 (preferred, best compression and browser support)
- WOFF (good browser support)
- TTF/OTF (fallback for older browsers)

## Usage

Define custom fonts in your SCSS:

```scss
@font-face {
  font-family: 'CustomFont';
  src: url('../fonts/custom-font.woff2') format('woff2'),
       url('../fonts/custom-font.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

## Best Practices

- Use `font-display: swap` for better performance
- Provide multiple font formats for better browser support
- Optimize font files to reduce loading time
- Consider using variable fonts for multiple weights/styles
- Use system fonts as fallbacks when possible

## Current Setup

The application currently uses system fonts for optimal performance and consistency across platforms.
