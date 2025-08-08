# Chatbot Integration Setup Guide

## Overview
The chatbot has been successfully integrated into the Matrix Library Management System. It provides AI-powered assistance for library-related queries and general questions.

## Features
- **Library Query Detection**: Automatically detects library-specific questions
- **Book Search**: Find books by title, author, or subject
- **Location Information**: Get rack and department information for books
- **Digital Resources**: Search for digital resources and PDFs
- **Programming Books**: Special handling for programming language queries
- **General AI**: Falls back to Gemini AI for general questions
- **Welcome Announcement**: Shows a friendly popup when the page loads

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the frontend root directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Gemini AI Configuration (Optional - for general queries)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# Other configurations
REACT_APP_ENVIRONMENT=development
```

### 2. Backend Setup
The backend routes have been configured:
- Book routes are now included in `app.js`
- `searchBooksWithLocation` endpoint is available at `/api/books/search/location`
- All necessary controllers are in place

### 3. Frontend Components
The chatbot is integrated in:
- `src/components/chatbot/Chatbot.jsx` - Main chatbot component
- `src/components/chatbot/ChatbotAnnouncement.jsx` - Welcome popup
- `src/layouts/student/index.jsx` - Student layout integration

### 4. API Integration
The chatbot uses these API endpoints:
- `GET /api/books/search/location?query=<search>` - Search books with location
- `GET /api/books` - Get all books
- `GET /api/digital-library/public` - Get digital resources

## Usage Examples

### Library Queries
- "Where is Harry Potter?"
- "Do we have Python programming books?"
- "Show me digital resources for mathematics"
- "List all books in the library"

### General Queries
- "What are the library hours?"
- "How do I borrow a book?"
- "What's the weather like?"

## Troubleshooting

### Common Issues

1. **API Key Error**: If you see Gemini API errors, check your API key in the environment variables
2. **Book Search Not Working**: Ensure the backend is running and book routes are accessible
3. **Announcement Not Showing**: Check if the component is properly imported

### Debug Mode
The chatbot includes extensive console logging. Open browser dev tools to see:
- Query detection results
- API call responses
- Error messages

## Customization

### Adding New Query Types
1. Add detection patterns in `isLibraryQuery()` function
2. Create a new handler function
3. Add the handler to `getLibraryAnswer()` function

### Styling
The chatbot uses Tailwind CSS classes and can be customized by modifying the className props.

### API Integration
To add new API endpoints:
1. Create the endpoint in the backend
2. Add the function to the appropriate API file
3. Import and use in the chatbot

## Security Notes
- API keys should be stored in environment variables
- The chatbot respects authentication headers
- All API calls include proper error handling

## Performance
- Responses are limited to prevent overwhelming the user
- API calls are debounced to prevent spam
- Loading states provide user feedback

## Future Enhancements
- Voice input/output
- Chat history persistence
- Multi-language support
- Advanced book recommendations
- Integration with calendar events 