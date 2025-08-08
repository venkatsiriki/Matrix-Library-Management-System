// Test script to check if API key is valid
// Replace YOUR_API_KEY_HERE with your actual API key

const API_KEY = 'AIzaSyCkfaauk6R8sLP9mbypyiX6_dy2j1TCNdw'; // Your Gemini API key

async function testAPIKey() {
  console.log('🧪 Testing API Key...');
  console.log('🔑 Using API Key:', API_KEY.substring(0, 10) + '...');
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Explain how AI works in a few words"
              }
            ]
          }
        ]
      })
    });
    
    console.log('📡 Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API Response Success!');
    console.log('🤖 AI Response:', data.candidates[0].content.parts[0].text);
    return true;
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return false;
  }
}

// Instructions
console.log('📋 Instructions:');
console.log('1. Replace YOUR_API_KEY_HERE with your actual API key');
console.log('2. Run: node test-api-key.js');
console.log('3. Check if the API key is valid\n');

// Check if API key is placeholder
if (API_KEY === 'YOUR_API_KEY_HERE') {
  console.log('⚠️  Please replace YOUR_API_KEY_HERE with your actual API key!');
  console.log('🔗 Get API key from: https://makersuite.google.com/app/apikey');
} else {
  testAPIKey().then(isValid => {
    console.log(isValid ? '✅ API Key is VALID!' : '❌ API Key is INVALID!');
  });
} 