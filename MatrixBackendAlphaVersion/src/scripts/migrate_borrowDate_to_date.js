// migrate_borrowDate_to_date.js
// Run this script with: node src/scripts/migrate_borrowDate_to_date.js

const mongoose = require('mongoose');
const BorrowRecord = require('../models/borrowRecord');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matrix';

async function migrateBorrowDates() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Find all records where borrowDate is a string
  const records = await BorrowRecord.find({ borrowDate: { $type: 'string' } });
  console.log(`Found ${records.length} records to update.`);

  let updated = 0;
  for (const record of records) {
    // Convert string date (YYYY-MM-DD) to Date object (midnight UTC)
    const dateStr = record.borrowDate;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const newDate = new Date(dateStr + 'T00:00:00.000Z');
      record.borrowDate = newDate;
      await record.save();
      updated++;
    }
  }

  console.log(`Updated ${updated} records.`);
  await mongoose.disconnect();
  console.log('Migration complete.');
}

migrateBorrowDates().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 