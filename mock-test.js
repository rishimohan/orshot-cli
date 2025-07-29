#!/usr/bin/env node

// Mock test to demonstrate how the CLI would work with a full-permission API key
const axios = require('axios');

async function mockUserEndpoint() {
  console.log('🎭 Mock Test: Simulating a full-permission API key response');
  console.log('');
  
  // This is what a successful response from /v1/me/user_id would look like
  const mockResponse = {
    data: {
      user_id: 'fc682dab-dbbe-4519-bfb2-2953bfbb1c9f',
      email: 'user@example.com',
      name: 'John Doe'
    }
  };
  
  console.log('✅ Successful login would show:');
  console.log('   User ID: fc682dab-dbbe-4519-bfb2-2953bfbb1c9f');
  console.log('   Name: John Doe');
  console.log('   Email: user@example.com');
  console.log('   Domain: https://api.orshot.com');
  console.log('');
  console.log('🔍 Current behavior with your API key:');
  console.log('   - User endpoint returns 403 (Access Forbidden)');
  console.log('   - CLI falls back to templates endpoint for validation');
  console.log('   - Shows "authenticated" instead of actual user data');
  console.log('');
  console.log('💡 Possible solutions:');
  console.log('   1. Check if you have a different API key with user permissions');
  console.log('   2. Contact support about API key permissions');
  console.log('   3. The current behavior is actually working correctly - some API keys are intentionally limited');
}

mockUserEndpoint();
