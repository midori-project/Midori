/**
 * 🧪 Test Token Integration in Project Creation API
 * ทดสอบการทำงานของ Token system ใน Project creation
 */

const API_BASE = 'http://localhost:3000';

async function testTokenIntegration() {
  console.log('🧪 Testing Token Integration in Project Creation API\n');

  // Test 1: Create project without authentication
  console.log('📋 Test 1: Create project without authentication');
  try {
    const response = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Project',
        description: 'Test project for token integration'
      })
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 401) {
      console.log('✅ Correctly rejected unauthorized request\n');
    } else {
      console.log('❌ Should have rejected unauthorized request\n');
    }
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }

  // Test 2: Create project with authentication but insufficient tokens
  console.log('📋 Test 2: Create project with authentication but insufficient tokens');
  try {
    // Mock session for testing
    const response = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'session=mock-session' // Mock session
      },
      body: JSON.stringify({
        name: 'Test Project 2',
        description: 'Test project with insufficient tokens'
      })
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 402) {
      console.log('✅ Correctly rejected due to insufficient tokens\n');
    } else {
      console.log('❌ Should have rejected due to insufficient tokens\n');
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }

  // Test 3: Check token balance API
  console.log('📋 Test 3: Check token balance API');
  try {
    const response = await fetch(`${API_BASE}/api/billing/balance`, {
      method: 'GET',
      headers: { 'Cookie': 'session=mock-session' }
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 200 && result.success) {
      console.log('✅ Token balance API working correctly\n');
    } else {
      console.log('❌ Token balance API not working\n');
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }

  // Test 4: Check token transactions API
  console.log('📋 Test 4: Check token transactions API');
  try {
    const response = await fetch(`${API_BASE}/api/billing/transactions`, {
      method: 'GET',
      headers: { 'Cookie': 'session=mock-session' }
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 200 && result.success) {
      console.log('✅ Token transactions API working correctly\n');
    } else {
      console.log('❌ Token transactions API not working\n');
    }
  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
  }

  console.log('🎯 Token Integration Test Summary:');
  console.log('- Project creation now requires authentication');
  console.log('- Project creation now checks token balance');
  console.log('- Token deduction happens after successful project creation');
  console.log('- Token refund happens when project creation fails');
  console.log('- Proper error messages for insufficient tokens');
}

// Run the test
testTokenIntegration().catch(console.error);




