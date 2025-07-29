const { Command } = require("commander");
const chalk = require("chalk");
const config = require("../config");
const api = require("../api");

// Library templates command
const library = new Command("library")
  .description("List library templates")
  .option("-l, --limit <number>", "Limit number of results", "20")
  .option("-j, --json", "Output as JSON")
  .action(async (options) => {
    try {
      config.requireAuth();

      const templates = await api.getLibraryTemplates();

      if (options.json) {
        console.log(JSON.stringify(templates, null, 2));
        return;
      }

      if (!templates || templates.length === 0) {
        console.log(chalk.yellow("📝 No library templates found"));
        return;
      }

      console.log(chalk.green(`📚 Library Templates (${templates.length}):`));
      console.log();

      const limit = parseInt(options.limit) || 20;
      const displayTemplates = templates.slice(0, limit);

      displayTemplates.forEach((template, index) => {
        console.log(
          `${chalk.blue(`${index + 1}.`)} ${chalk.bold(template.title || "Untitled")}`
        );
        console.log(`   ${chalk.gray("ID:")} ${template.id}`);
        if (template.description) {
          console.log(
            `   ${chalk.gray("Description:")} ${template.description}`
          );
        }
        if (template.modifications && template.modifications.length > 0) {
          console.log(
            `   ${chalk.gray("Modifications:")} ${template.modifications.length} available`
          );
        }
        console.log();
      });

      if (templates.length > limit) {
        console.log(
          chalk.yellow(`... and ${templates.length - limit} more templates`)
        );
        console.log(
          chalk.gray(`Use --limit ${templates.length} to see all templates`)
        );
      }
    } catch (error) {
      console.error(
        chalk.red("❌ Failed to fetch library templates:"),
        error.message
      );
      process.exit(1);
    }
  });

// Studio templates command
const studio = new Command("studio")
  .description("List studio templates")
  .option("-l, --limit <number>", "Limit number of results", "20")
  .option("-j, --json", "Output as JSON")
  .action(async (options) => {
    try {
      config.requireAuth();

      const templates = await api.getStudioTemplates();

      if (options.json) {
        console.log(JSON.stringify(templates, null, 2));
        return;
      }

      if (!templates || templates.length === 0) {
        console.log(chalk.yellow("🎨 No studio templates found"));
        return;
      }

      console.log(chalk.green(`🎨 Studio Templates (${templates.length}):`));
      console.log();

      const limit = parseInt(options.limit) || 20;
      const displayTemplates = templates.slice(0, limit);

      displayTemplates.forEach((template, index) => {
        console.log(
          `${chalk.blue(`${index + 1}.`)} ${chalk.bold(template.name || "Untitled")}`
        );
        console.log(`   ${chalk.gray("ID:")} ${template.id}`);
        if (template.description) {
          console.log(
            `   ${chalk.gray("Description:")} ${template.description}`
          );
        }
        console.log();
      });

      if (templates.length > limit) {
        console.log(
          chalk.yellow(`... and ${templates.length - limit} more templates`)
        );
        console.log(
          chalk.gray(`Use --limit ${templates.length} to see all templates`)
        );
      }
    } catch (error) {
      console.error(
        chalk.red("❌ Failed to fetch studio templates:"),
        error.message
      );
      process.exit(1);
    }
  });

// Template modifications command
const modifications = new Command("modifications")
  .description("Show available modifications for a template")
  .argument("<template-id>", "Template ID")
  .option("-t, --type <type>", "Template type (library|studio)", "library")
  .option("-j, --json", "Output as JSON")
  .action(async (templateId, options) => {
    try {
      config.requireAuth();

      let modifications;

      if (options.type === "studio") {
        modifications = await api.getStudioTemplateModifications(templateId);
      } else {
        modifications = await api.getLibraryTemplateModifications(templateId);
      }

      if (options.json) {
        console.log(JSON.stringify(modifications, null, 2));
        return;
      }

      if (!modifications || modifications.length === 0) {
        console.log(
          chalk.yellow(
            `🔧 No modifications found for ${options.type} template: ${templateId}`
          )
        );
        return;
      }

      console.log(
        chalk.green(
          `🔧 Modifications for ${options.type} template: ${templateId}`
        )
      );
      console.log();

      modifications.forEach((mod, index) => {
        console.log(
          `${chalk.blue(`${index + 1}.`)} ${chalk.bold(mod.key || mod.id)}`
        );
        if (mod.description) {
          console.log(`   ${chalk.gray("Description:")} ${mod.description}`);
        }
        if (mod.type) {
          console.log(`   ${chalk.gray("Type:")} ${mod.type}`);
        }
        console.log();
      });
    } catch (error) {
      console.error(
        chalk.red("❌ Failed to fetch template modifications:"),
        error.message
      );
      console.error(
        chalk.gray(
          "💡 Make sure the template ID is correct and you have access to it"
        )
      );
      process.exit(1);
    }
  });

module.exports = {
  library,
  studio,
  modifications,
};
