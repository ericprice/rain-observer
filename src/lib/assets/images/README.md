# Images Directory

This directory is for storing image assets used in the Rain Observer application.

## Supported Formats

- SVG (preferred for icons and simple graphics)
- PNG (for complex graphics and screenshots)
- JPEG (for photographs)
- WebP (for optimized web images)

## Usage

Import images in your Svelte components:

```svelte
<script>
  import myImage from '../lib/assets/images/my-image.png';
</script>

<img src={myImage} alt="Description" />
```

## Organization

- Keep image files organized by feature or component
- Use descriptive filenames
- Optimize images for web use
- Consider using responsive images where appropriate
