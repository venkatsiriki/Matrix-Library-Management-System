const mongoose = require('mongoose');

const digitalResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Notes",
      "Previous Papers",
      "Tools",
      "Resources",
      "Prep Materials",
      "Model Papers",
      "Assignments",
      "E-books",
      "Video Lectures",
      "Research Papers",
      "Competitive",
      "Others"
    ]
  },
  department: {
    type: String,
    required: true,
    enum: [
      "CSE",
      "ECE",
      "MECH",
      "CIVIL",
      "MCA",
      "AI/ML",
      "IT",
      "EEE",
      "BCA",
      "BBA",
      "BCOM",
      "MBA",
      "BIOTECH",
      "CHEM",
      "COMPETITIVE",
      "GENERAL"
    ]
  },
  description: {
    type: String,
    // required: true
  },
  url: {
    type: String,
    trim: true
  },
  fileId: {
    type: String
  },
  fileName: {
    type: String
  },
  mimeType: {
    type: String
  },
  fileSize: {
    type: Number
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add text index for search functionality
digitalResourceSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

module.exports = mongoose.model('DigitalResource', digitalResourceSchema); 