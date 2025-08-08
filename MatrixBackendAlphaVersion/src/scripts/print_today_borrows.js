// print_today_borrows.js
// Run with: node src/scripts/print_today_borrows.js

const mongoose = require('mongoose');
const BorrowRecord = require('../models/borrowRecord');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matrix';

async function printTodayBorrows() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Get today's date range in local timezone
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const records = await BorrowRecord.find({
    borrowDate: { $gte: startOfDay, $lte: endOfDay }
  });

  console.log(`Found ${records.length} borrow records for today (${startOfDay.toISOString().slice(0,10)}):`);
  records.forEach(r => {
    console.log(`- ${r._id} | Book: ${r.book} | Student: ${r.student} | borrowDate: ${r.borrowDate}`);
  });

  await mongoose.disconnect();
  console.log('Done.');
}

printTodayBorrows().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 