#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');

// Import commands
const authCommands = require('../src/commands/auth');
const templateCommands = require('../src/commands/templates');
const generateCommands = require('../src/commands/generate');

// Set up the main program
program
  .name('orshot')
  .description('CLI for Orshot - Automated Image Generation')
  .version(packageJson.version);

// Auth commands
program
  .command('auth')
  .description('Manage authentication')
  .addCommand(authCommands.login)
  .addCommand(authCommands.logout)
  .addCommand(authCommands.whoami);

// Template commands
program
  .command('templates')
  .description('Manage templates')
  .addCommand(templateCommands.library)
  .addCommand(templateCommands.studio)
  .addCommand(templateCommands.modifications);

// Generate commands
program
  .command('generate')
  .description('Generate images')
  .addCommand(generateCommands.library)
  .addCommand(generateCommands.studio);

// Add global help
program.addHelpText(
  'after',
  `
${chalk.yellow('Examples:')}
  ${chalk.cyan('orshot auth login <api-key>')}        Log in with your API key
  ${chalk.cyan('orshot auth whoami')}                 Show current user info
  ${chalk.cyan('orshot templates library')}          List library templates
  ${chalk.cyan('orshot templates studio')}           List studio templates
  ${chalk.cyan('orshot generate library <id>')}      Generate from library template
  ${chalk.cyan('orshot generate studio <id>')}       Generate from studio template

${chalk.yellow('Documentation:')}
  Visit ${chalk.blue('https://orshot.com/docs')} for more information
`
);

// Parse arguments
program.parse();
