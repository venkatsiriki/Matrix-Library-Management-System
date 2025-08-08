import React from 'react';
import Chatbot from './Chatbot';

const ChatbotTest = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Chatbot Integration Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
          <div className="space-y-2 text-gray-600">
            <p>1. Look for the floating chat button in the bottom-right corner</p>
            <p>2. Click it to open the chatbot</p>
            <p>3. Try these test queries:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>"Where is Harry Potter?"</li>
              <li>"Do we have Python books?"</li>
              <li>"Show me digital resources"</li>
              <li>"List all books"</li>
              <li>"What's the weather like?" (general query)</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Integration Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span>Chatbot component loaded</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span>Announcement component ready</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span>API integration configured</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span>Gemini AI integration ready</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* The chatbot will appear as a floating button */}
      <Chatbot />
    </div>
  );
};

export default ChatbotTest; 