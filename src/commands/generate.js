const { Command } = require("commander");
const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const config = require("../config");
const api = require("../api");

// Utility function to save image
async function saveImage(imageData, filename, format, responseType) {
  try {
    if (responseType === "base64") {
      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
      await fs.writeFile(filename, base64Data, "base64");
    } else if (responseType === "binary") {
      await fs.writeFile(filename, imageData);
    } else if (responseType === "url") {
      console.log(chalk.blue("🔗 Image URL:"), imageData.url || imageData);
      return;
    }

    console.log(chalk.green(`💾 Image saved as: ${filename}`));
  } catch (error) {
    console.error(chalk.red("❌ Failed to save image:"), error.message);
  }
}

// Parse modifications from CLI arguments
function parseModifications(modificationsArray) {
  const modifications = {};

  if (modificationsArray && modificationsArray.length > 0) {
    modificationsArray.forEach((mod) => {
      const [key, value] = mod.split("=", 2);
      if (key && value !== undefined) {
        modifications[key] = value;
      }
    });
  }

  return modifications;
}

// Library generate command
const library = new Command("library")
  .description("Generate image from library template")
  .argument("<template-id>", "Library template ID")
  .option(
    "-m, --modification <key=value...>",
    "Template modifications (can be used multiple times)",
    []
  )
  .option(
    "-f, --format <format>",
    "Output format (png|jpg|jpeg|webp|pdf)",
    "png"
  )
  .option("-t, --type <type>", "Response type (base64|binary|url)", "base64")
  .option("-o, --output <filename>", "Output filename")
  .option("-i, --interactive", "Interactive mode to set modifications")
  .option("-j, --json", "Output response as JSON")
  .action(async (templateId, options) => {
    try {
      config.requireAuth();

      let modifications = parseModifications(options.modification);

      // Interactive mode
      if (options.interactive) {
        console.log(chalk.blue("🔄 Fetching available modifications..."));

        try {
          const availableMods =
            await api.getLibraryTemplateModifications(templateId);

          if (availableMods && availableMods.length > 0) {
            console.log(chalk.green("📝 Available modifications:"));

            const answers = await inquirer.prompt(
              availableMods.map((mod) => ({
                type: "input",
                name: mod.key,
                message: `${mod.description || mod.key}:`,
                default: modifications[mod.key] || "",
              }))
            );

            // Only add non-empty values
            Object.keys(answers).forEach((key) => {
              if (answers[key].trim()) {
                modifications[key] = answers[key].trim();
              }
            });
          } else {
            console.log(
              chalk.yellow("⚠️  No modifications available for this template")
            );
          }
        } catch (error) {
          console.log(
            chalk.yellow(
              "⚠️  Could not fetch modifications, continuing with provided values"
            )
          );
        }
      }

      console.log(chalk.blue("🎨 Generating image..."));

      const result = await api.generateFromLibrary(templateId, modifications, {
        format: options.format,
        responseType: options.type,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(chalk.green("✅ Image generated successfully!"));

      // Save image if not URL type
      if (options.type !== "url") {
        const outputFilename =
          options.output ||
          `orshot-${templateId}-${Date.now()}.${options.format}`;
        await saveImage(
          result.data.content || result,
          outputFilename,
          options.format,
          options.type
        );
      } else {
        console.log(
          chalk.blue("🔗 Image URL:"),
          result.url || result.data || result
        );
      }

      if (Object.keys(modifications).length > 0) {
        console.log(chalk.gray("📝 Used modifications:"));
        Object.entries(modifications).forEach(([key, value]) => {
          console.log(chalk.gray(`   ${key}: ${value}`));
        });
      }
    } catch (error) {
      console.error(chalk.red("❌ Failed to generate image:"), error.message);
      process.exit(1);
    }
  });

// Studio generate command
const studio = new Command("studio")
  .description("Generate image from studio template")
  .argument("<template-id>", "Studio template ID")
  .option(
    "-d, --data <key=value...>",
    "Template data (can be used multiple times)",
    []
  )
  .option(
    "-f, --format <format>",
    "Output format (png|jpg|jpeg|webp|pdf)",
    "png"
  )
  .option("-t, --type <type>", "Response type (base64|binary|url)", "base64")
  .option("-o, --output <filename>", "Output filename")
  .option("-w, --webhook <url>", "Webhook URL for notifications")
  .option("-i, --interactive", "Interactive mode to set data")
  .option("-j, --json", "Output response as JSON")
  .action(async (templateId, options) => {
    try {
      config.requireAuth();

      let data = parseModifications(options.data);

      // Interactive mode
      if (options.interactive) {
        console.log(chalk.blue("🔄 Fetching available data fields..."));

        try {
          const availableFields =
            await api.getStudioTemplateModifications(templateId);

          if (availableFields && availableFields.length > 0) {
            console.log(chalk.green("📝 Available data fields:"));

            const answers = await inquirer.prompt(
              availableFields.map((field) => ({
                type: "input",
                name: field.id,
                message: `${field.description || field.id}:`,
                default: data[field.id] || "",
              }))
            );

            // Only add non-empty values
            Object.keys(answers).forEach((key) => {
              if (answers[key].trim()) {
                data[key] = answers[key].trim();
              }
            });
          } else {
            console.log(
              chalk.yellow("⚠️  No data fields available for this template")
            );
          }
        } catch (error) {
          console.log(
            chalk.yellow(
              "⚠️  Could not fetch data fields, continuing with provided values"
            )
          );
        }
      }

      console.log(chalk.blue("🎨 Generating image from studio template..."));

      const result = await api.generateFromStudio(templateId, data, {
        format: options.format,
        responseType: options.type,
        webhook: options.webhook,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(chalk.green("✅ Image generated successfully!"));

      // Save image if not URL type
      if (options.type !== "url") {
        const outputFilename =
          options.output ||
          `orshot-studio-${templateId}-${Date.now()}.${options.format}`;
        await saveImage(
          result.data.content || result,
          outputFilename,
          options.format,
          options.type
        );
      } else {
        console.log(
          chalk.blue("🔗 Image URL:"),
          result.url || result.data || result
        );
      }

      if (Object.keys(data).length > 0) {
        console.log(chalk.gray("📝 Used data:"));
        Object.entries(data).forEach(([key, value]) => {
          console.log(chalk.gray(`   ${key}: ${value}`));
        });
      }

      if (options.webhook) {
        console.log(chalk.blue("🔔 Webhook configured:"), options.webhook);
      }
    } catch (error) {
      console.error(chalk.red("❌ Failed to generate image:"), error.message);
      process.exit(1);
    }
  });

module.exports = {
  library,
  studio,
};
