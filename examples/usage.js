#!/usr/bin/env node

/**
 * Example usage of Orshot CLI
 * This script demonstrates how to use the CLI programmatically
 */

const { exec } = require("child_process");
const path = require("path");

// Path to the CLI binary
const cliPath = path.join(__dirname, "..", "bin", "orshot.js");

// Example API key (replace with your actual key)
const API_KEY = "your-orshot-api-key-here";

async function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(`node ${cliPath} ${command}`, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
        return;
      }
      resolve(stdout);
    });
  });
}

async function example() {
  try {
    console.log("🚀 Orshot CLI Example");
    console.log("====================");

    // Step 1: Login
    console.log("\\n1. Logging in...");
    await runCommand(`auth login ${API_KEY}`);
    console.log("✅ Logged in successfully");

    // Step 2: Check authentication
    console.log("\\n2. Checking user info...");
    const userInfo = await runCommand("auth whoami");
    console.log(userInfo);

    // Step 3: List library templates
    console.log("\\n3. Listing library templates...");
    const libraryTemplates = await runCommand("templates library --limit 5");
    console.log(libraryTemplates);

    // Step 4: List studio templates
    console.log("\\n4. Listing studio templates...");
    const studioTemplates = await runCommand("templates studio --limit 5");
    console.log(studioTemplates);

    // Step 5: Show template modifications (example)
    // Uncomment and replace with actual template ID
    // console.log('\\n5. Showing template modifications...');
    // const modifications = await runCommand('templates modifications your-template-id');
    // console.log(modifications);

    // Step 6: Generate image (example)
    // Uncomment and replace with actual template ID
    // console.log('\\n6. Generating image...');
    // const generateResult = await runCommand('generate library your-template-id -o example-output.png');
    // console.log(generateResult);

    console.log("\\n🎉 Example completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.stderr || error.error?.message);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  if (API_KEY === "your-orshot-api-key-here") {
    console.error("❌ Please set your API key in the example script");
    console.error(
      '   Edit examples/usage.js and replace "your-orshot-api-key-here" with your actual API key'
    );
    process.exit(1);
  }

  example();
}
