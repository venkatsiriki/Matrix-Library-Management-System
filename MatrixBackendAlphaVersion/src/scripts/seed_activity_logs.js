const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');

const MONGO_URI = 'mongodb://localhost:27017/matrix'; // Change if your DB URI is different

const students = [
  { rollNumber: '20MCA001', name: 'Rahul Kumar', branch: 'MCA' },
  { rollNumber: '20MCA002', name: 'Priya Singh', branch: 'MCA' },
  { rollNumber: '20MCA003', name: 'Amit Patel', branch: 'MCA' },
  { rollNumber: '21MCA001', name: 'Sneha Gupta', branch: 'MCA' },
  { rollNumber: '21MCA002', name: 'Mohammed Ali', branch: 'MCA' },
];

const sections = [
  'Reference - Study Section',
  'Central Library',
  'Reading Room',
  'E-Library',
];

function pad(num) {
  return num.toString().padStart(2, '0');
}

async function seedLogs() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await ActivityLog.deleteMany({}); // Clear old logs for demo

  const logs = [];
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    for (const student of students) {
      // Each student checks in and out once per day
      const section = sections[Math.floor(Math.random() * sections.length)];
      const hourIn = 8 + Math.floor(Math.random() * 5); // Between 8am and 12pm
      const minIn = Math.floor(Math.random() * 60);
      const hourOut = hourIn + 2 + Math.floor(Math.random() * 3); // 2-4 hours later
      const minOut = Math.floor(Math.random() * 60);
      logs.push({
        rollNumber: student.rollNumber,
        name: student.name,
        branch: student.branch,
        section,
        isStudySection: section.includes('Reference'),
        timeIn: `${pad(hourIn)}:${pad(minIn)}`,
        timeOut: `${pad(hourOut)}:${pad(minOut)}`,
        date: dateStr,
        status: 'Checked Out',
        duration: '',
      });
    }
  }
  await ActivityLog.insertMany(logs);
  console.log(`Seeded ${logs.length} activity logs.`);
  await mongoose.disconnect();
}

seedLogs().catch(err => {
  console.error(err);
  process.exit(1);
}); 