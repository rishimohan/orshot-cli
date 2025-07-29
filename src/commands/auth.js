const { Command } = require("commander");
const chalk = require("chalk");
const inquirer = require("inquirer");
const config = require("../config");
const api = require("../api");

// Login command
const login = new Command("login")
  .description("Log in with your Orshot API key")
  .argument("[api-key]", "Your Orshot API key")
  .option("-d, --domain <domain>", "API domain", "https://api.orshot.com")
  .action(async (apiKey, options) => {
    try {
      // If no API key provided, prompt for it
      if (!apiKey) {
        const answers = await inquirer.prompt([
          {
            type: "password",
            name: "apiKey",
            message: "Enter your Orshot API key:",
            mask: "*",
            validate: (input) => {
              if (!input.trim()) {
                return "API key is required";
              }
              return true;
            },
          },
        ]);
        apiKey = answers.apiKey;
      }

      // Set the domain if provided
      if (options.domain) {
        config.setDomain(options.domain);
      }

      // Save the API key
      config.setApiKey(apiKey);

      // Debug info
      if (process.env.DEBUG) {
        console.log(chalk.gray('Debug - Domain:', config.getDomain()));
        console.log(chalk.gray('Debug - API Key:', apiKey.substring(0, 8) + '...'));
      }

      console.log(chalk.blue("🔄 Verifying API key..."));

      // Test the API key by getting user info
      const user = await api.getCurrentUser();

      // Save user info
      config.setUser(user);

      console.log(chalk.green("✅ Successfully logged in!"));
      console.log(chalk.gray(`   User ID: ${user.user_id || "Unknown"}`));
      console.log(chalk.gray(`   Name: ${user.name || "Not available"}`));
      console.log(chalk.gray(`   Email: ${user.email || "Not available"}`));
      console.log(chalk.gray(`   Domain: ${config.getDomain()}`));
    } catch (error) {
      // Clear invalid credentials
      config.clear();
      console.error(chalk.red("❌ Login failed:"), error.message);
      
      // Provide debugging suggestions
      if (error.message.includes('Network error')) {
        console.error(chalk.yellow('💡 Troubleshooting tips:'));
        console.error(chalk.gray('   - Check your internet connection'));
        console.error(chalk.gray('   - Verify the domain is correct:', config.getDomain()));
        console.error(chalk.gray('   - Try again in a few moments'));
      } else if (error.message.includes('Invalid API key')) {
        console.error(chalk.yellow('💡 Troubleshooting tips:'));
        console.error(chalk.gray('   - Double-check your API key from https://orshot.com/dashboard/developers'));
        console.error(chalk.gray('   - Make sure there are no extra spaces or characters'));
        console.error(chalk.gray('   - Verify your account has API access'));
      }
      
      console.error(chalk.gray('\n🐛 For debugging, run with: DEBUG=1 orshot auth login <api-key>'));
      process.exit(1);
    }
  });

// Logout command
const logout = new Command("logout")
  .description("Log out and clear stored credentials")
  .action(() => {
    config.clear();
    console.log(chalk.green("✅ Successfully logged out"));
  });

// Whoami command
const whoami = new Command("whoami")
  .description("Show current user information")
  .action(async () => {
    try {
      config.requireAuth();

      console.log(chalk.blue("🔄 Fetching user information..."));

      const user = await api.getCurrentUser();

      console.log(chalk.green("✅ Current user:"));
      console.log(chalk.gray(`   User ID: ${user.user_id || "Unknown"}`));
      console.log(chalk.gray(`   Name: ${user.name || "Not available"}`));
      console.log(chalk.gray(`   Email: ${user.email || "Not available"}`));
      console.log(chalk.gray(`   Domain: ${config.getDomain()}`));
      console.log(
        chalk.gray(`   API Key: ${config.getApiKey().substring(0, 8)}...`)
      );
    } catch (error) {
      console.error(chalk.red("❌ Failed to get user info:"), error.message);
      console.error(
        chalk.yellow(
          "💡 Try logging in again: orshot auth login <your-api-key>"
        )
      );
      process.exit(1);
    }
  });

module.exports = {
  login,
  logout,
  whoami,
};
