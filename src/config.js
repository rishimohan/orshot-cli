const Conf = require('conf');
const chalk = require('chalk');

class Config {
  constructor() {
    this.config = new Conf({
      projectName: 'orshot-cli',
      schema: {
        apiKey: {
          type: 'string',
        },
        domain: {
          type: 'string',
          default: 'https://api.orshot.com',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    });
  }

  getApiKey() {
    return this.config.get('apiKey');
  }

  setApiKey(apiKey) {
    this.config.set('apiKey', apiKey);
  }

  getDomain() {
    return this.config.get('domain', 'https://api.orshot.com');
  }

  setDomain(domain) {
    this.config.set('domain', domain);
  }

  getUser() {
    return this.config.get('user');
  }

  setUser(user) {
    this.config.set('user', user);
  }

  clear() {
    this.config.clear();
  }

  isAuthenticated() {
    return !!this.getApiKey();
  }

  requireAuth() {
    if (!this.isAuthenticated()) {
      console.error(chalk.red('❌ Not authenticated. Please run:'));
      console.error(chalk.yellow('   orshot auth login <your-api-key>'));
      process.exit(1);
    }
  }
}

module.exports = new Config();
