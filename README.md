# Orshot CLI

A command-line interface for [Orshot](https://orshot.com) - AI powered visual content generation platform. Generate images, pdfs and videos from [your templates](https://orshot.com/templates) directly from your terminal

## Installation

```bash
npm install -g orshot-cli
```

## Quick Start

1. **Login with your API key:**

   ```bash
   orshot auth login <your-api-key>
   ```

2. **List available templates:**

   ```bash
   orshot templates library
   orshot templates studio
   ```

3. **Generate an image:**
   ```bash
   orshot generate library <template-id>
   orshot generate studio <template-id>
   ```

## Commands

### Authentication

#### `orshot auth login [api-key]`

Log in with your Orshot API key. If no key is provided, you'll be prompted to enter it securely.

**Options:**

- `-d, --domain <domain>` - API domain (default: https://api.orshot.com)

**Examples:**

```bash
orshot auth login your-api-key-here
orshot auth login  # Will prompt for API key
```

#### `orshot auth logout`

Log out and clear stored credentials.

#### `orshot auth whoami`

Show current user information and authentication status.

### Templates

#### `orshot templates library`

List your library templates.

**Options:**

- `-l, --limit <number>` - Limit number of results (default: 20)
- `-j, --json` - Output as JSON

#### `orshot templates studio`

List your studio templates.

**Options:**

- `-l, --limit <number>` - Limit number of results (default: 20)
- `-j, --json` - Output as JSON

#### `orshot templates modifications <template-id>`

Show available modifications for a template.

**Options:**

- `-t, --type <type>` - Template type: library or studio (default: library)
- `-j, --json` - Output as JSON

**Examples:**

```bash
orshot templates modifications abc123
orshot templates modifications def456 --type studio
```

### Generate Images

#### `orshot generate library <template-id>`

Generate an image from a library template.

**Options:**

- `-m, --modification <key=value>` - Template modifications (can be used multiple times)
- `-f, --format <format>` - Output format: png, jpg, jpeg, webp, pdf (default: png)
- `-t, --type <type>` - Response type: base64, binary, url (default: base64)
- `-o, --output <filename>` - Output filename
- `-i, --interactive` - Interactive mode to set modifications
- `-j, --json` - Output response as JSON

**Examples:**

```bash
# Basic generation
orshot generate library abc123

# With modifications
orshot generate library abc123 -m title="Hello World" -m color="blue"

# Interactive mode
orshot generate library abc123 --interactive

# Custom output
orshot generate library abc123 -o my-image.png -f png

# Get URL instead of downloading
orshot generate library abc123 -t url
```

#### `orshot generate studio <template-id>`

Generate an image, PDF, or video from a studio template.

**Options:**

- `-m, --modification <key=value>` - Template modifications (can be used multiple times)
- `-f, --format <format>` - Output format: png, jpg, webp, pdf, mp4, webm, gif (default: png)
- `-t, --type <type>` - Response type: base64, binary, url (default: base64)
- `-o, --output <filename>` - Output filename
- `-s, --scale <number>` - Scale factor (e.g. 2 for 2x size)
- `-p, --pages <numbers...>` - Specific pages to render (e.g. 1 3)
- `--dpi <number>` - DPI for PDF output
- `--quality <number>` - Quality (1-100) for JPG/WebP/Video
- `--video-loop` - Loop video output
- `--video-muted` - Mute video audio
- `--video-trim-start <seconds>` - Video start time in seconds
- `--video-trim-end <seconds>` - Video end time in seconds
- `--webhook <url>` - Webhook URL for async notification
- `-i, --interactive` - Interactive mode to set modifications
- `-j, --json` - Output response as JSON

**Examples:**

```bash
# Basic generation
orshot generate studio def456

# With modifications
orshot generate studio def456 -m name="John Doe" -m title="CEO"

# Generate Video (MP4)
orshot generate studio video-template-id -f mp4 --video-loop

# Generate Multi-page PDF
orshot generate studio pdf-template-id -f pdf --pages 1 2 3 --dpi 300

# Generate 2x Scaled Image
orshot generate studio img-template-id -s 2

# Async generation via Webhook
orshot generate studio heavy-template -f mp4 --webhook https://mysite.com/hook
```

# Interactive mode

orshot generate studio def456 --interactive

# Custom output

orshot generate studio def456 -o my-studio-image.png -f png

````

## Configuration

The CLI stores your configuration in your system's config directory:

- **macOS:** `~/Library/Preferences/orshot-cli/config.json`
- **Linux:** `~/.config/orshot-cli/config.json`
- **Windows:** `%APPDATA%/orshot-cli/config.json`

## API Key

Get your API key from Orshot Workspace > Settings > API Key [here](https://orshot.com/signup).

## Output Formats

- **PNG** - Best for images with transparency
- **JPG/JPEG** - Best for photos and images without transparency
- **WebP** - Modern format with good compression
- **PDF** - For documents and print-ready files

## Response Types

- **base64** - Image data as base64 string (default)
- **binary** - Raw binary data
- **url** - Returns a URL to the generated image

## Examples

### Complete Workflow Example

```bash
# Login
orshot auth login your-api-key

# Check authentication
orshot auth whoami

# List library templates
orshot templates library

# Check available modifications for a template
orshot templates modifications template-123

# Generate image with modifications
orshot generate library template-123 \\
  -m title="My Custom Title" \\
  -m background_color="#ff0000" \\
  -o custom-image.png

# Generate from studio template interactively
orshot generate studio studio-456 --interactive
````

### Batch Processing

```bash
# Generate multiple variations
orshot generate library template-123 -m title="Version 1" -o v1.png
orshot generate library template-123 -m title="Version 2" -o v2.png
orshot generate library template-123 -m title="Version 3" -o v3.png
```

## Error Handling

The CLI provides detailed error messages and suggestions:

```bash
❌ Login failed: Invalid API key. Please check your credentials.

❌ Failed to generate image: Template not found.
💡 Make sure the template ID is correct and you have access to it

❌ Not authenticated. Please run:
   orshot auth login <your-api-key>
```

## Support

- **Documentation:** [https://orshot.com/docs](https://orshot.com/docs)
- **API Reference:** [https://orshot.com/docs/api-reference](https://orshot.com/docs/api-reference)
- **Support:** [hi@orshot.com](mailto:hi@orshot.com)

## License

MIT License - see [LICENSE](LICENSE) file for details.
