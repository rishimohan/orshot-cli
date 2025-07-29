# Contributing to Orshot CLI

Thank you for your interest in contributing to Orshot CLI! This document provides guidelines and information for contributors.

## Development Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/rishimohan/orshot-cli
   cd orshot-cli
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Test the CLI locally:**
   ```bash
   node bin/orshot.js --help
   ```

## Project Structure

```
orshot-cli/
├── bin/
│   └── orshot.js          # Main CLI entry point
├── src/
│   ├── api.js             # API client for Orshot
│   ├── config.js          # Configuration management
│   ├── index.js           # Main module exports
│   └── commands/
│       ├── auth.js        # Authentication commands
│       ├── templates.js   # Template management commands
│       └── generate.js    # Image generation commands
├── examples/
│   └── usage.js           # Usage examples
├── package.json
├── README.md
└── CHANGELOG.md
```

## Code Style

- Use CommonJS modules (`require`/`module.exports`)
- Use 2-space indentation
- Use single quotes for strings
- Use semicolons
- Follow ESLint configuration

**Run linting:**

```bash
npm run lint
```

## Adding New Commands

1. **Create command file** in `src/commands/`
2. **Export command objects** using Commander.js
3. **Import and register** in `bin/orshot.js`

Example command structure:

```javascript
const { Command } = require("commander");
const chalk = require("chalk");
const config = require("../config");
const api = require("../api");

const myCommand = new Command("mycommand")
  .description("Description of my command")
  .argument("<required-arg>", "Required argument description")
  .option("-o, --option <value>", "Optional parameter")
  .action(async (requiredArg, options) => {
    try {
      config.requireAuth();

      // Command logic here
      const result = await api.someMethod(requiredArg, options);

      console.log(chalk.green("✅ Success!"));
      console.log(result);
    } catch (error) {
      console.error(chalk.red("❌ Error:"), error.message);
      process.exit(1);
    }
  });

module.exports = {
  myCommand,
};
```

## Error Handling

- Always use try-catch blocks for async operations
- Provide helpful error messages with chalk colors
- Use `config.requireAuth()` for commands that need authentication
- Exit with code 1 for errors, 0 for success

## API Integration

- Use the `api.js` module for all API calls
- Add spinner indicators for long-running operations
- Handle common HTTP errors (401, 403, 404, 429)
- Include proper error context in error messages

## Testing

Before submitting changes:

1. **Test basic functionality:**

   ```bash
   node bin/orshot.js --help
   node bin/orshot.js auth --help
   node bin/orshot.js templates --help
   node bin/orshot.js generate --help
   ```

2. **Test without authentication:**

   ```bash
   node bin/orshot.js templates library
   # Should show authentication error
   ```

3. **Test with valid API key** (if available):
   ```bash
   node bin/orshot.js auth login your-api-key
   node bin/orshot.js auth whoami
   node bin/orshot.js templates library
   ```

## Documentation

- Update README.md for new features
- Add examples for new commands
- Update CHANGELOG.md following semantic versioning
- Include JSDoc comments for complex functions

## Submitting Changes

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages:**
   ```bash
   git commit -m "Add: New feature description"
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/my-new-feature
   ```
7. **Create a Pull Request**

## Pull Request Guidelines

- **Clear title and description**
- **Link to related issues**
- **Include test cases if applicable**
- **Update documentation as needed**
- **Follow the existing code style**

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Publish to npm (maintainers only)

## Support

For questions or help:

- Open an issue on GitHub
- Check existing documentation
- Contact [support@orshot.com](mailto:support@orshot.com)

Thank you for contributing! 🎉
