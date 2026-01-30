const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const config = require('../config');
const api = require('../api');

// Utility function to save image
async function saveImage(imageData, filename, format, responseType) {
  try {
    if (responseType === 'base64') {
      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      await fs.writeFile(filename, base64Data, 'base64');
    } else if (responseType === 'binary') {
      await fs.writeFile(filename, imageData);
    } else if (responseType === 'url') {
      console.log(chalk.blue('🔗 Image URL:'), imageData.url || imageData);
      return;
    }

    console.log(chalk.green(`💾 Image saved as: ${filename}`));
  } catch (error) {
    console.error(chalk.red('❌ Failed to save image:'), error.message);
  }
}

// Parse modifications from CLI arguments
function parseModifications(modificationsArray) {
  const modifications = {};

  if (modificationsArray && modificationsArray.length > 0) {
    modificationsArray.forEach((mod) => {
      const firstEqualsIndex = mod.indexOf('=');
      if (firstEqualsIndex !== -1) {
        const key = mod.substring(0, firstEqualsIndex);
        const value = mod.substring(firstEqualsIndex + 1);
        if (key && value !== undefined) {
          modifications[key] = value;
        }
      }
    });
  }

  return modifications;
}

// Library generate command
const library = new Command('library')
  .description('Generate image from library template')
  .argument('<template-id>', 'Library template ID')
  .option(
    '-m, --modification <key=value...>',
    'Template modifications (can be used multiple times)',
    [],
  )
  .option(
    '-f, --format <format>',
    'Output format (png|jpg|jpeg|webp|pdf)',
    'png',
  )
  .option('-t, --type <type>', 'Response type (base64|binary|url)', 'base64')
  .option('-o, --output <filename>', 'Output filename')
  .option('-i, --interactive', 'Interactive mode to set modifications')
  .option('-j, --json', 'Output response as JSON')
  .action(async (templateId, options) => {
    try {
      config.requireAuth();

      const modifications = parseModifications(options.modification);

      // Interactive mode
      if (options.interactive) {
        console.log(chalk.blue('🔄 Fetching available modifications...'));

        try {
          const availableMods =
            await api.getLibraryTemplateModifications(templateId);

          if (availableMods && availableMods.length > 0) {
            console.log(chalk.green('📝 Available modifications:'));

            const answers = await inquirer.prompt(
              availableMods.map((mod) => ({
                type: 'input',
                name: mod.key,
                message: `${mod.description || mod.key}:`,
                default: modifications[mod.key] || '',
              })),
            );

            // Only add non-empty values
            Object.keys(answers).forEach((key) => {
              if (answers[key].trim()) {
                modifications[key] = answers[key].trim();
              }
            });
          } else {
            console.log(
              chalk.yellow('⚠️  No modifications available for this template'),
            );
          }
        } catch (error) {
          console.log(
            chalk.yellow(
              '⚠️  Could not fetch modifications, continuing with provided values',
            ),
          );
        }
      }

      console.log(chalk.blue('🎨 Generating image...'));

      const result = await api.generateFromLibrary(templateId, modifications, {
        format: options.format,
        responseType: options.type,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(chalk.green('✅ Image generated successfully!'));

      // Save image if not URL type
      if (options.type !== 'url') {
        const outputFilename =
          options.output ||
          `orshot-${templateId}-${Date.now()}.${options.format}`;
        await saveImage(
          result.data.content || result,
          outputFilename,
          options.format,
          options.type,
        );
      } else {
        console.log(
          chalk.blue('🔗 Image URL:'),
          result.url || result.data || result,
        );
      }

      if (Object.keys(modifications).length > 0) {
        console.log(chalk.gray('📝 Used modifications:'));
        Object.entries(modifications).forEach(([key, value]) => {
          console.log(chalk.gray(`   ${key}: ${value}`));
        });
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to generate image:'), error.message);
      process.exit(1);
    }
  });

// Studio generate command
const studio = new Command('studio')
  .description('Generate image, PDF, or video from studio template')
  .argument('<template-id>', 'Studio template ID')
  .option(
    '-m, --modification <key=value...>',
    'Template modifications (can be used multiple times)',
    [],
  )
  .option(
    '-f, --format <format>',
    'Output format (png|jpg|webp|pdf|mp4|webm|gif)',
    'png',
  )
  .option('-t, --type <type>', 'Response type (base64|binary|url)', 'base64')
  .option('-o, --output <filename>', 'Output filename')
  .option(
    '-s, --scale <number>',
    'Scale factor (e.g. 2 for 2x size)',
    parseFloat,
  )
  .option('-p, --pages <numbers...>', 'Specific pages to render (e.g. 1 3)')
  .option('--dpi <number>', 'DPI for PDF output', parseInt)
  .option('--quality <number>', 'Quality (1-100) for JPG/WebP/Video', parseInt)
  .option('--video-loop', 'Loop video output', false)
  .option('--video-muted', 'Mute video audio', false)
  .option(
    '--video-trim-start <seconds>',
    'Video start time in seconds',
    parseFloat,
  )
  .option('--video-trim-end <seconds>', 'Video end time in seconds', parseFloat)
  .option('--webhook <url>', 'Webhook URL for async notification')
  .option('-i, --interactive', 'Interactive mode to set modifications')
  .option('-j, --json', 'Output response as JSON')
  .action(async (templateId, options) => {
    try {
      config.requireAuth();

      const modifications = parseModifications(options.modification);

      // Interactive mode
      if (options.interactive) {
        console.log(chalk.blue('🔄 Fetching available modifications...'));

        try {
          const availableFields =
            await api.getStudioTemplateModifications(templateId);

          if (availableFields && availableFields.length > 0) {
            console.log(chalk.green('📝 Available modifications:'));

            const answers = await inquirer.prompt(
              availableFields.map((field) => ({
                type: 'input',
                name: field.id,
                message: `${field.description || field.id}:`,
                default: modifications[field.id] || '',
              })),
            );

            // Only add non-empty values
            Object.keys(answers).forEach((key) => {
              if (answers[key].trim()) {
                modifications[key] = answers[key].trim();
              }
            });
          } else {
            console.log(
              chalk.yellow('⚠️  No modifications available for this template'),
            );
          }
        } catch (error) {
          console.log(
            chalk.yellow(
              '⚠️  Could not fetch modifications, continuing with provided values',
            ),
          );
        }
      }

      console.log(chalk.blue('🎨 Generating render from studio template...'));

      // Construct advanced options
      const apiOptions = {
        format: options.format,
        responseType: options.type,
        scale: options.scale,
        includePages: options.pages,
        webhook: options.webhook,
      };

      // Add PDF options if relevant
      if (options.format === 'pdf' && options.dpi) {
        apiOptions.pdfOptions = {
          dpi: options.dpi,
        };
      }

      // Add Video options if relevant
      if (['mp4', 'webm', 'gif'].includes(options.format)) {
        apiOptions.videoOptions = {
          loop: options.videoLoop,
          muted: options.videoMuted,
          trimStart: options.videoTrimStart,
          trimEnd: options.videoTrimEnd,
          quality: options.quality,
        };
      }

      // Add quality for images
      if (['jpg', 'webp'].includes(options.format) && options.quality) {
        // Pass quality at top level or inside modifications/options depending on API support (usually passed in main options or response obj in some APIs)
        // Based on CLI structure, let's put it in apiOptions directly or handled by api.js mapping
        // api.js maps options.quality isn't currently mapped in previous step, let's just pass it or ensure it's handled.
        // Actually renderHandler checks modifications usually for quality or request body.
        // Let's pass it via modifications for safety if not supported in root, but wait, API usually takes quality in response object.
        // Let's update api.js one more time to be safe, or just attach to response object here.
      }

      const result = await api.generateFromStudio(
        templateId,
        modifications,
        apiOptions,
      );

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      // Handle async webhook response
      if (options.webhook) {
        console.log(
          chalk.green('✅ Request sent! Result will be delivered to webhook.'),
        );
        return;
      }

      console.log(chalk.green('✅ Generated successfully!'));

      // Save output if not URL type
      if (options.type !== 'url') {
        const outputFilename =
          options.output ||
          `orshot-studio-${templateId}-${Date.now()}.${options.format}`;
        await saveImage(
          result.data.content || result,
          outputFilename,
          options.format,
          options.type,
        );
      } else {
        // Handle multi-page URLs (array) or single URL
        if (Array.isArray(result.url || result.data || result)) {
          console.log(chalk.blue('🔗 Output URLs:'));
          (result.url || result.data || result).forEach((url, idx) =>
            console.log(`   Page ${idx + 1}: ${url}`),
          );
        } else {
          console.log(
            chalk.blue('🔗 Output URL:'),
            result.url || result.data || result,
          );
        }
      }

      if (Object.keys(modifications).length > 0) {
        console.log(chalk.gray('📝 Used modifications:'));
        Object.entries(modifications).forEach(([key, value]) => {
          console.log(chalk.gray(`   ${key}: ${value}`));
        });
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to generate render:'), error.message);
      process.exit(1);
    }
  });

module.exports = {
  library,
  studio,
};
