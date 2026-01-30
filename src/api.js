const axios = require('axios');
const config = require('./config');
const ora = require('ora');

class OrshotAPI {
  constructor() {
    // Don't store baseURL at construction time, get it dynamically
  }

  getBaseURL() {
    return config.getDomain();
  }

  getHeaders() {
    const apiKey = config.getApiKey();
    if (!apiKey) {
      throw new Error('No API key found. Please authenticate first.');
    }

    return {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'orshot-cli/1.0.0',
    };
  }

  async request(method, endpoint, data = null, options = {}) {
    const spinner = options.showSpinner
      ? ora('Making request...').start()
      : null;

    try {
      const baseURL = this.getBaseURL(); // Get baseURL dynamically

      // Create clean axios config without spreading options that might conflict
      const axiosConfig = {
        method,
        url: `${baseURL}${endpoint}`,
        headers: this.getHeaders(),
        timeout: 300000, // 5 minutes timeout for video generation
      };

      // Only add data if it exists
      if (data) {
        axiosConfig.data = data;
      }

      const response = await axios(axiosConfig);

      if (spinner) spinner.succeed('Request completed');
      return response.data;
    } catch (error) {
      if (spinner) spinner.fail('Request failed');

      let errorMessage = 'Unknown error occurred';

      if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          errorMessage = 'Invalid API key. Please check your credentials.';
        } else if (status === 403) {
          errorMessage = 'Access forbidden. Check your API key permissions.';
        } else if (status === 404) {
          errorMessage = 'Resource not found.';
        } else if (status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else {
          errorMessage = data?.error || data?.message || `HTTP ${status} error`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // User methods
  async getCurrentUser() {
    // Make GET request to /v1/me/user_id with Bearer token
    const response = await this.request('GET', '/v1/me/user_id', null, {
      showSpinner: true,
    });

    // Handle different response structures from the API
    if (response && response.data) {
      // Response has nested data object
      return {
        user_id: response.data.user_id || response.data.id || 'Unknown',
        email: response.data.email || '',
        name: response.data.name || response.data.full_name || '',
        full_name: response.data.full_name || response.data.name || '', // Alias for compatibility
      };
    } else if (
      response &&
      (response.user_id || response.id || response.email || response.name)
    ) {
      // Response has user data directly
      return {
        user_id: response.user_id || response.id || 'Unknown',
        email: response.email || '',
        name: response.name || response.full_name || '',
        full_name: response.full_name || response.name || '', // Alias for compatibility
      };
    }

    // Default return for any other structure
    return {
      user_id: 'Unknown',
      email: '',
      name: '',
      full_name: '',
    };
  }

  // Template methods
  async getLibraryTemplates() {
    return this.request('GET', '/v1/templates', null, { showSpinner: true });
  }

  async getStudioTemplates() {
    return this.request('GET', '/v1/studio/templates', null, {
      showSpinner: true,
    });
  }

  async getLibraryTemplateModifications(templateId) {
    return this.request(
      'GET',
      `/v1/templates/modifications?template_id=${templateId}`,
      null,
      { showSpinner: true },
    );
  }

  async getStudioTemplateModifications(templateId) {
    return this.request(
      'GET',
      `/v1/studio/template/modifications?templateId=${templateId}`,
      null,
      { showSpinner: true },
    );
  }

  // Generate methods
  async generateFromLibrary(templateId, modifications = {}, options = {}) {
    const requestBody = {
      templateId,
      modifications,
      source: 'orshot-cli',
      response: {
        format: options.format || 'png',
        type: options.responseType || 'base64',
      },
    };

    return this.request('POST', '/v1/generate/images', requestBody, {
      showSpinner: true,
    });
  }

  async generateFromStudio(templateId, data = {}, options = {}) {
    const requestBody = {
      templateId,
      modifications: data, // Studio API expects 'modifications', not 'data'
      source: 'orshot-cli',
      response: {
        format: options.format || 'png',
        type: options.responseType || 'base64',
        scale: options.scale,
        includePages: options.includePages,
        quality: options.quality,
      },
      pdfOptions: options.pdfOptions,
      videoOptions: options.videoOptions,
      webhook: options.webhook,
    };

    return this.request('POST', '/v1/studio/render', requestBody, {
      showSpinner: true,
    });
  }
}

module.exports = new OrshotAPI();
