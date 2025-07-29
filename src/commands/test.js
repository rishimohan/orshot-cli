const { Command } = require('commander');
const chalk = require('chalk');
const config = require('../config');
const api = require('../api');

// Test command for debugging API calls
const test = new Command('test')
  .description('Test API connectivity (debug command)')
  .option('-e, --endpoint <endpoint>', 'API endpoint to test', '/v1/templates')
  .action(async (options) => {
    try {
      config.requireAuth();
      
      console.log(chalk.blue('🔍 Testing API connectivity...'));
      console.log(chalk.gray(`Domain: ${config.getDomain()}`));
      console.log(chalk.gray(`Endpoint: ${options.endpoint}`));
      console.log(chalk.gray(`API Key: ${config.getApiKey().substring(0, 8)}...`));
      console.log('');
      
      // Enable debug mode for this request
      process.env.DEBUG = '1';
      
      const result = await api.request('GET', options.endpoint, null, { showSpinner: true });
      
      console.log(chalk.green('✅ API test successful!'));
      console.log('Response preview:', JSON.stringify(result, null, 2).substring(0, 500) + '...');
      
    } catch (error) {
      console.error(chalk.red('❌ API test failed:'), error.message);
      process.exit(1);
    }
  });

module.exports = {
  test
};
