const axios = require("axios");
const config = require("./config");
const chalk = require("chalk");
const ora = require("ora");

class OrshotAPI {
  constructor() {
    this.baseURL = config.getDomain();
  }

  getHeaders() {
    const apiKey = config.getApiKey();
    if (!apiKey) {
      throw new Error("No API key found. Please authenticate first.");
    }

    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "orshot-cli/1.0.0",
    };
  }

  async request(method, endpoint, data = null, options = {}) {
    const spinner = options.showSpinner
      ? ora("Making request...").start()
      : null;

    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: this.getHeaders(),
        data,
        ...options,
      });

      if (spinner) spinner.succeed("Request completed");
      return response.data;
    } catch (error) {
      if (spinner) spinner.fail("Request failed");

      let errorMessage = "Unknown error occurred";

      if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          errorMessage = "Invalid API key. Please check your credentials.";
        } else if (status === 403) {
          errorMessage = "Access forbidden. Check your API key permissions.";
        } else if (status === 404) {
          errorMessage = "Resource not found.";
        } else if (status === 429) {
          errorMessage = "Rate limit exceeded. Please try again later.";
        } else {
          errorMessage = data?.error || data?.message || `HTTP ${status} error`;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // User methods
  async getCurrentUser() {
    return this.request("GET", "/v1/me/user_id", null, { showSpinner: true });
  }

  // Template methods
  async getLibraryTemplates() {
    return this.request("GET", "/v1/templates", null, { showSpinner: true });
  }

  async getStudioTemplates() {
    return this.request("GET", "/v1/studio/templates", null, {
      showSpinner: true,
    });
  }

  async getLibraryTemplateModifications(templateId) {
    return this.request(
      "GET",
      `/v1/templates/modifications?template_id=${templateId}`,
      null,
      { showSpinner: true }
    );
  }

  async getStudioTemplateModifications(templateId) {
    return this.request(
      "GET",
      `/v1/studio/template/modifications?templateId=${templateId}`,
      null,
      { showSpinner: true }
    );
  }

  // Generate methods
  async generateFromLibrary(templateId, modifications = {}, options = {}) {
    const requestBody = {
      templateId,
      modifications,
      source: "cli",
      response: {
        format: options.format || "png",
        type: options.responseType || "base64",
      },
    };

    return this.request("POST", "/v1/generate/images", requestBody, {
      showSpinner: true,
    });
  }

  async generateFromStudio(templateId, data = {}, options = {}) {
    const requestBody = {
      templateId,
      data,
      source: "cli",
      response: {
        format: options.format || "png",
        type: options.responseType || "base64",
      },
    };

    if (options.webhook) {
      requestBody.webhook = options.webhook;
    }

    return this.request("POST", "/v1/studio/render", requestBody, {
      showSpinner: true,
    });
  }
}

module.exports = new OrshotAPI();
