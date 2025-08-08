// clear_all_borrow_records.js
// Run with: node src/scripts/clear_all_borrow_records.js

const mongoose = require('mongoose');
const BorrowRecord = require('../models/borrowRecord');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matrix';

async function clearAllBorrowRecords() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const result = await BorrowRecord.deleteMany({});
  console.log(`Deleted ${result.deletedCount} borrow records.`);

  await mongoose.disconnect();
  console.log('Done.');
}

clearAllBorrowRecords().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 