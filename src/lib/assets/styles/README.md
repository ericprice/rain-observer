# SCSS Styles

This directory contains the SCSS styles for the Rain Observer application.

## Structure

- `main.scss` - Main stylesheet that imports all partials
- `_reset.scss` - CSS reset and base element styles
- `_fonts.scss` - Font definitions and typography utilities
- `README.md` - This documentation file

## Partial Files

### `_reset.scss`
Contains CSS reset styles and base element styling to ensure consistent appearance across browsers.

### `_fonts.scss`
Contains font family definitions, typography scale, and text utility classes.

### `main.scss`
Main stylesheet that imports partials and contains component-specific styles.

## Usage

The main SCSS file is imported directly in the page components:

```svelte
<script>
  import '../lib/assets/styles/main.scss';
</script>
```

## CSS Custom Properties (Variables)

The styles use CSS custom properties for consistent theming:

- `--font-family` - System font stack (defined in _fonts.scss)
- `--text-color` - Primary text color
- `--text-muted` - Secondary text color
- `--text-very-muted` - Tertiary text color
- `--text-warning` - Warning text color
- `--overlay-bg` - Overlay background gradient
- `--spacing-*` - Consistent spacing values
- `--border-radius` - Border radius values

## Components

The styles are organized by component:

- `.webcam-container` - Main webcam view container
- `.weather-overlay` - Weather information overlay
- `.weather-conditions` - Weather data display
- `.status-footer` - Status information footer
- `.no-webcam-container` - No webcam available state

## Adding New Styles

When adding new styles:

1. **For global styles**: Add to the appropriate partial file (`_reset.scss`, `_fonts.scss`)
2. **For component styles**: Add to `main.scss` or create a new partial file
3. **For new partials**: Create `_filename.scss` and import in `main.scss`
4. Use the existing CSS custom properties for consistency
5. Follow the BEM-like naming convention
6. Add comments for new sections
7. Keep styles organized by component

## Hot Reload

Changes to any of the partial files (`_reset.scss`, `_fonts.scss`) will automatically trigger browser reloads since they are imported into `main.scss`, which is imported by the Svelte components.
