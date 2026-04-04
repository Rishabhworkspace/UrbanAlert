const fs = require('fs');
const path = require('path');

async function runTest() {
  try {
    console.log('1. Logging in as citizen...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'johndoe@example.com',
        password: 'password123',
        source: 'citizen'
      })
    });
    
    if (!loginRes.ok) throw new Error('Login failed: ' + loginRes.statusText);
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Logged in successfully. Token received.');

    console.log('\n2. Creating dummy blob for image...');
    const formData = new FormData();
    formData.append('title', 'Pothole on Main St test');
    formData.append('description', 'There is a massive pothole causing traffic issues test');
    formData.append('category', 'Roads');
    formData.append('latitude', '40.7128');
    formData.append('longitude', '-74.0060');
    formData.append('address', '123 Main St');
    
    // Create a dummy text file blob to mimic an image upload
    const dummyBlob = new Blob(['dummy content'], { type: 'image/jpeg' });
    formData.append('photo', dummyBlob, 'dummy.jpg');

    console.log('\n3. Submitting issue...');
    try {
      const response = await fetch('http://localhost:5000/api/issues', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const responseData = await response.text();
      if (!response.ok) {
        console.error('\n❌ FAILED TO REPORT ISSUE:');
        console.error('Status:', response.status);
        console.error('Data:', responseData);
      } else {
        console.log('✅ Issue reported successfully:', JSON.parse(responseData));
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
    }
  } catch (err) {
    console.error('Test script failure:', err.message);
  }
}

runTest();
