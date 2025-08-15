const nodemailer = require('nodemailer');

// Create transporter with better error handling
const createTransporter = () => {
  // Check if email credentials are available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not found. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const transporter = createTransporter();

// Verify transporter connection only if credentials are available
if (transporter) {
  transporter.verify(function(error, success) {
    if (error) {
      console.error('Nodemailer transporter verification failed:', error);
      console.log('To fix Gmail SMTP issues:');
      console.log('1. Enable 2-factor authentication on your Gmail account');
      console.log('2. Generate an App Password: https://myaccount.google.com/apppasswords');
      console.log('3. Use the App Password instead of your regular password');
    } else {
      console.log('Nodemailer server is ready to send emails');
    }
  });
}

const sendEmail = async (to, subject, html) => {
  // Check if email is configured
  if (!transporter) {
    console.warn('Email not configured. Skipping email send.');
    return false;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in environment variables.');
    throw new Error('Email configuration missing');
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    
    // Don't throw error for email failures - just log and continue
    console.warn('Email sending failed, but continuing with operation');
    return false;
  }
};

module.exports = { sendEmail }; 