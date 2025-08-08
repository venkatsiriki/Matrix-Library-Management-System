const { google } = require('googleapis');
require('dotenv').config();

let drive = null;
let FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1eNzHigzp8I1cYQi1FZ03MUeoXb4myCXn';

// Only initialize Google Drive if credentials are provided
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
  try {
    // Parse the base64 encoded credentials
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf-8')
    );

    // Initialize the Google Drive API client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    drive = google.drive({ version: 'v3', auth });
    console.log('Google Drive API initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Drive API:', error.message);
    console.log('Google Drive features will be disabled');
  }
} else {
  console.log('GOOGLE_APPLICATION_CREDENTIALS_BASE64 not set - Google Drive features disabled');
}

module.exports = {
  drive,
  FOLDER_ID
}; 