// Test script to check Gemini API functionality
const GEMINI_API_KEY = 'AIzaSyCRtYGBKKTFIx2FnBJSTlEyJoYitHm6lSg';

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...');
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello! Can you respond with a simple "Hello from Gemini!" message?'
          }]
        }]
      })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log('🤖 Gemini Response:', responseText);
      return true;
    } else {
      console.error('❌ No valid response in data');
      return false;
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return false;
  }
}

// Run the test
testGeminiAPI().then(success => {
  console.log(success ? '✅ Gemini API is working!' : '❌ Gemini API is not working');
}); 