const Student = require("../models/Student");
const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const sectionSeatLimits = {
  central: 450,
  reference: 300,
  reading: 400,
  elibrary: 100,
};

// Check-in a student
const checkIn = asyncHandler(async (req, res) => {
  const { rollNumber, section } = req.body;
  if (!rollNumber || !section) {
    res.status(400);
    throw new Error("Roll number and section are required");
  }

  console.log(`Checking in: rollNumber=${rollNumber}, section=${section}`);

  const student = await Student.findOne({
    rollNumber: { $regex: `^${rollNumber}$`, $options: "i" },
  });
  if (!student) {
    console.log(`Student not found: ${rollNumber}`);
    res.status(404);
    throw new Error("Student not found");
  }

  const today = new Date().toISOString().split("T")[0];
  const activeLog = await ActivityLog.findOne({
    rollNumber: { $regex: `^${rollNumber}$`, $options: "i" },
    date: today,
    timeOut: null,
    status: "Checked In",
  });

  if (activeLog) {
    console.log(
      `Active log found: ${activeLog.section}, rollNumber=${rollNumber}`
    );
    res.status(400);
    throw new Error(`Student is already checked in to ${activeLog.section}`);
  }

  const now = new Date();
  const currentTime = now.toLocaleTimeString("en-IN", { hour12: false });
  let sectionLabel = section;
  let isStudySection = false;
  let seatSection = section; // For seat limit check

  if (section === "reference") {
    const isAfter430 =
      now.getHours() > 16 || (now.getHours() === 16 && now.getMinutes() >= 30);
    sectionLabel = isAfter430 ? "Reference - Study Section" : "Reference";
    isStudySection = isAfter430;
    seatSection = "reference"; // Map to reference for seat counts
  } else if (section === "central") {
    sectionLabel = "Central Library";
    seatSection = "central";
  } else if (section === "reading") {
    sectionLabel = "Reading Room";
    seatSection = "reading";
  } else if (section === "elibrary") {
    sectionLabel = "E-Library";
    seatSection = "elibrary";
  } else {
    console.log(`Invalid section: ${section}`);
    res.status(400);
    throw new Error("Invalid section");
  }

  // Count active check-ins for the seat section
  const activeCheckIns = await ActivityLog.countDocuments({
    $or: [
      { section: sectionLabel },
      { section: { $in: ["Reference", "Reference - Study Section"] } }, // Include both for reference
    ],
    date: today,
    timeOut: null,
    status: "Checked In",
  });

  if (activeCheckIns >= sectionSeatLimits[seatSection]) {
    console.log(
      `No seats available in ${sectionLabel}: ${activeCheckIns}/${sectionSeatLimits[seatSection]}`
    );
    res.status(400);
    throw new Error(`No seats available in ${sectionLabel}`);
  }

  const log = new ActivityLog({
    rollNumber: student.rollNumber,
    name: student.name,
    branch: student.branch,
    section: sectionLabel,
    isStudySection,
    timeIn: currentTime,
    date: today,
    status: "Checked In",
  });

  await log.save();
  console.log(
    `Check-in saved: ${log._id}, rollNumber=${rollNumber}, section=${sectionLabel}, seatSection=${seatSection}`
  );
  res.status(201).json(log);
});

// Check-out a student
const checkOut = asyncHandler(async (req, res) => {
  const { rollNumber, section } = req.body;
  if (!rollNumber || !section) {
    res.status(400);
    throw new Error("Roll number and section are required");
  }

  console.log(`Checking out: rollNumber=${rollNumber}, section=${section}`);

  const student = await Student.findOne({
    rollNumber: { $regex: `^${rollNumber}$`, $options: "i" },
  });
  if (!student) {
    console.log(`Student not found: ${rollNumber}`);
    res.status(404);
    throw new Error("Student not found");
  }

  const today = new Date().toISOString().split("T")[0];
  let sectionLabel = section;
  let seatSection = section;

  if (section === "reference") {
    const now = new Date();
    const isAfter430 =
      now.getHours() > 16 || (now.getHours() === 16 && now.getMinutes() >= 30);
    sectionLabel = isAfter430 ? "Reference - Study Section" : "Reference";
    seatSection = "reference";
  } else if (section === "central") {
    sectionLabel = "Central Library";
    seatSection = "central";
  } else if (section === "reading") {
    sectionLabel = "Reading Room";
    seatSection = "reading";
  } else if (section === "elibrary") {
    sectionLabel = "E-Library";
    seatSection = "elibrary";
  } else {
    console.log(`Invalid section: ${section}`);
    res.status(400);
    throw new Error("Invalid section");
  }

  const activeLog = await ActivityLog.findOne({
    rollNumber: { $regex: `^${rollNumber}$`, $options: "i" },
    date: today,
    $or: [
      { section: sectionLabel },
      // If checking out from reference, match both Reference and Reference - Study Section
      ...(section === "reference" ? [
        { section: "Reference" },
        { section: "Reference - Study Section" }
      ] : [])
    ],
    timeOut: null,
    status: "Checked In",
  });

  if (!activeLog) {
    console.log(
      `No active check-in found: rollNumber=${rollNumber}, section=${sectionLabel}`
    );
    res.status(400);
    throw new Error(
      "No active check-in found for this student in the specified section"
    );
  }

  const currentTime = new Date().toLocaleTimeString("en-IN", { hour12: false });
  const checkInTime = new Date(`${today} ${activeLog.timeIn}`);
  const checkOutTime = new Date(`${today} ${currentTime}`);
  const durationMs = checkOutTime - checkInTime;
  const duration = `${Math.floor(durationMs / 3600000)}h ${Math.floor(
    (durationMs % 3600000) / 60000
  )}m`;

  activeLog.timeOut = currentTime;
  activeLog.status = "Checked Out";
  activeLog.duration = duration;

  await activeLog.save();
  console.log(
    `Check-out saved: ${activeLog._id}, rollNumber=${rollNumber}, section=${sectionLabel}, seatSection=${seatSection}`
  );
  res.json(activeLog);
});

// Transfer a student's section
const transfer = asyncHandler(async (req, res) => {
  const { rollNumber, fromSection, toSection, isStudySection } = req.body;
  if (!rollNumber || !fromSection || !toSection) {
    res.status(400);
    throw new Error("Roll number, fromSection, and toSection are required");
  }

  console.log(
    `Transferring: rollNumber=${rollNumber}, from=${fromSection}, to=${toSection}`
  );

  const student = await Student.findOne({
    rollNumber: { $regex: `^${rollNumber}$`, $options: "i" },
  });
  if (!student) {
    console.log(`Student not found: ${rollNumber}`);
    res.status(404);
    throw new Error("Student not found");
  }

  const today = new Date().toISOString().split("T")[0];
  let fromSectionLabel = fromSection;
  let fromSeatSection = fromSection;

  if (fromSection === "reference") {
    fromSectionLabel = "Reference";
    fromSeatSection = "reference";
  } else if (fromSection === "central") {
    fromSectionLabel = "Central Library";
    fromSeatSection = "central";
  } else if (fromSection === "reading") {
    fromSectionLabel = "Reading Room";
    fromSeatSection = "reading";
  } else if (fromSection === "elibrary") {
    fromSectionLabel = "E-Library";
    fromSeatSection = "elibrary";
  }

  const activeLog = await ActivityLog.findOne({
    rollNumber: { $regex: `^${rollNumber}$`, $options: "i" },
    date: today,
    section: fromSectionLabel,
    timeOut: null,
    status: "Checked In",
  });

  if (!activeLog) {
    console.log(
      `No active check-in found: rollNumber=${rollNumber}, section=${fromSectionLabel}`
    );
    res.status(400);
    throw new Error(
      `No active check-in found for ${rollNumber} in ${fromSectionLabel}`
    );
  }

  let toSectionLabel = toSection;
  let toSeatSection = toSection;

  if (toSection === "reference") {
    toSectionLabel = isStudySection ? "Reference - Study Section" : "Reference";
    toSeatSection = "reference";
  } else if (toSection === "central") {
    toSectionLabel = "Central Library";
    toSeatSection = "central";
  } else if (toSection === "reading") {
    toSectionLabel = "Reading Room";
    toSeatSection = "reading";
  } else if (toSection === "elibrary") {
    toSectionLabel = "E-Library";
    toSeatSection = "elibrary";
  }

  // Check seat availability in the target section
  const activeCheckIns = await ActivityLog.countDocuments({
    $or: [
      { section: toSectionLabel },
      {
        section: { $in: ["Reference", "Reference - Study Section"] },
      },
    ],
    date: today,
    timeOut: null,
    status: "Checked In",
  });

  if (activeCheckIns >= sectionSeatLimits[toSeatSection]) {
    console.log(
      `No seats available in ${toSectionLabel}: ${activeCheckIns}/${sectionSeatLimits[toSeatSection]}`
    );
    res.status(400);
    throw new Error(`No seats available in ${toSectionLabel}`);
  }

  activeLog.section = toSectionLabel;
  activeLog.isStudySection = isStudySection || false;

  await activeLog.save();
  console.log(
    `Transfer saved: ${activeLog._id}, rollNumber=${rollNumber}, newSection=${toSectionLabel}, seatSection=${toSeatSection}`
  );
  res.json(activeLog);
});

// Get today's activity logs
const getTodayLogs = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const logs = await ActivityLog.find({ date: today }).sort({ createdAt: -1 });
  console.log(`Fetched ${logs.length} logs for today: ${today}`);
  res.json(logs);
});

// Get seat availability
const getSeatAvailability = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  console.log(`Fetching seat availability for date: ${today}`);

  const logs = await ActivityLog.find({
    date: today,
    timeOut: null,
    status: "Checked In",
  });

  console.log(`Found ${logs.length} active logs for today`);

  const occupiedBySection = {};

  // Initialize counts
  ["central", "reference", "reading", "elibrary"].forEach((key) => {
    occupiedBySection[key] = 0;
  });

  // Count active logs per section
  logs.forEach((log) => {
    let sectionKey;
    if (["Reference", "Reference - Study Section"].includes(log.section)) {
      sectionKey = "reference";
    } else if (log.section === "Central Library") {
      sectionKey = "central";
    } else if (log.section === "Reading Room") {
      sectionKey = "reading";
    } else if (log.section === "E-Library") {
      sectionKey = "elibrary";
    }
    if (sectionKey) {
      occupiedBySection[sectionKey]++;
    }
  });

  const availability = {
    central: {
      total: sectionSeatLimits.central,
      occupied: occupiedBySection.central || 0,
    },
    reference: {
      total: sectionSeatLimits.reference,
      occupied: occupiedBySection.reference || 0,
    },
    reading: {
      total: sectionSeatLimits.reading,
      occupied: occupiedBySection.reading || 0,
    },
    elibrary: {
      total: sectionSeatLimits.elibrary,
      occupied: occupiedBySection.elibrary || 0,
    },
  };

  console.log(`Seat availability: ${JSON.stringify(availability)}`);
  res.json(availability);
});

// Get student analytics
const getStudentAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const rollNumber = user.rollNumber;
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  // Get all logs for the last 30 days
  const logs = await ActivityLog.find({
    rollNumber: rollNumber,
    date: { $gte: thirtyDaysAgoStr, $lte: today },
    status: "Checked Out" // Only consider completed sessions
  }).sort({ date: 1 });

  // Calculate analytics
  const analytics = {
    totalVisits: logs.length,
    totalTimeSpent: 0, // in minutes
    sectionBreakdown: {},
    dailyTimeSpent: {},
    averageTimePerVisit: 0,
    mostVisitedSection: '',
    peakVisitTime: '',
    visitTrend: []
  };

  // Process logs
  logs.forEach(log => {
    // Calculate time spent in minutes for this session
    const timeIn = new Date(`${log.date} ${log.timeIn}`);
    const timeOut = new Date(`${log.date} ${log.timeOut}`);
    const timeSpentMinutes = Math.round((timeOut - timeIn) / (1000 * 60));
    
    // Update total time spent
    analytics.totalTimeSpent += timeSpentMinutes;
    
    // Update section breakdown
    if (!analytics.sectionBreakdown[log.section]) {
      analytics.sectionBreakdown[log.section] = {
        visits: 0,
        timeSpent: 0
      };
    }
    analytics.sectionBreakdown[log.section].visits++;
    analytics.sectionBreakdown[log.section].timeSpent += timeSpentMinutes;
    
    // Update daily time spent
    if (!analytics.dailyTimeSpent[log.date]) {
      analytics.dailyTimeSpent[log.date] = 0;
    }
    analytics.dailyTimeSpent[log.date] += timeSpentMinutes;
    
    // Track visit hour for peak time analysis
    const hour = timeIn.getHours();
    if (!analytics.visitTrend[hour]) {
      analytics.visitTrend[hour] = 0;
    }
    analytics.visitTrend[hour]++;
  });

  // Calculate averages and find peak values
  if (analytics.totalVisits > 0) {
    analytics.averageTimePerVisit = Math.round(analytics.totalTimeSpent / analytics.totalVisits);
    
    // Find most visited section
    analytics.mostVisitedSection = Object.entries(analytics.sectionBreakdown)
      .sort((a, b) => b[1].visits - a[1].visits)[0]?.[0] || '';
    
    // Find peak visit time
    const peakHour = analytics.visitTrend
      .map((count, hour) => ({ hour, count: count || 0 }))
      .sort((a, b) => b.count - a.count)[0];
    if (peakHour) {
      analytics.peakVisitTime = `${peakHour.hour}:00 - ${peakHour.hour + 1}:00`;
    }
  }

  // --- RANK CALCULATION ---
  // Get all logs for all students in the last 30 days
  const allLogs = await ActivityLog.find({
    date: { $gte: thirtyDaysAgoStr, $lte: today },
    status: "Checked Out"
  });

  // Calculate total time spent per student
  const studentTimeSpent = {};
  allLogs.forEach(log => {
    const timeIn = new Date(`${log.date} ${log.timeIn}`);
    const timeOut = new Date(`${log.date} ${log.timeOut}`);
    const timeSpentMinutes = Math.round((timeOut - timeIn) / (1000 * 60));
    if (!studentTimeSpent[log.rollNumber]) {
      studentTimeSpent[log.rollNumber] = 0;
    }
    studentTimeSpent[log.rollNumber] += timeSpentMinutes;
  });

  // Sort students by time spent
  const sorted = Object.entries(studentTimeSpent)
    .sort((a, b) => b[1] - a[1])
    .map(([rollNumber]) => rollNumber);

  const userRank = sorted.indexOf(rollNumber) + 1;
  analytics.rank = userRank > 0 ? userRank : null;
  // --- END RANK CALCULATION ---

  res.status(200).json({
    status: 'success',
    data: { analytics }
  });
});

// Get library time leaderboard (student-accessible)
const getLibraryLeaderboard = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  // Get all logs for the last 30 days
  const logs = await ActivityLog.find({
    date: { $gte: thirtyDaysAgoStr, $lte: today },
    status: 'Checked Out'
  });

  // Calculate time spent per student
  const studentTimeSpent = {};
  logs.forEach(log => {
    const timeIn = new Date(`${log.date} ${log.timeIn}`);
    const timeOut = new Date(`${log.date} ${log.timeOut}`);
    const timeSpentMinutes = Math.round((timeOut - timeIn) / (1000 * 60));
    if (!studentTimeSpent[log.rollNumber]) {
      studentTimeSpent[log.rollNumber] = { totalMinutes: 0, name: log.name };
    }
    studentTimeSpent[log.rollNumber].totalMinutes += timeSpentMinutes;
    studentTimeSpent[log.rollNumber].name = log.name;
  });

  // Build leaderboard array
  const leaderboard = Object.entries(studentTimeSpent).map(([rollNumber, data]) => ({
    rollNumber,
    name: data.name,
    totalHours: Math.floor(data.totalMinutes / 60)
  })).filter(entry => entry.totalHours > 0);

  // Sort by hours spent
  leaderboard.sort((a, b) => b.totalHours - a.totalHours);

  res.status(200).json({ status: 'success', data: { leaderboard } });
});

// Get overall analysis data with pagination and filters
const getOverallAnalysisData = asyncHandler(async (req, res) => {
  const { fromDate, toDate, section, department, search, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = {};
  
  if (fromDate && toDate) {
    filter.date = { $gte: fromDate, $lte: toDate };
  } else if (fromDate) {
    filter.date = { $gte: fromDate };
  } else if (toDate) {
    filter.date = { $lte: toDate };
  }
  
  if (section) {
    filter.section = section;
  }
  
  if (department) {
    filter.$or = [
      { department: department },
      { branch: department }
    ];
  }
  
  if (search) {
    filter.$or = [
      { rollNumber: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get total count
  const totalCount = await ActivityLog.countDocuments(filter);
  
  // Get paginated data
  const logs = await ActivityLog.find(filter)
    .sort({ date: -1, timeIn: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  const currentPage = parseInt(page);
  
  res.status(200).json({
    logs,
    pagination: {
      currentPage,
      totalPages,
      totalCount,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      limit: parseInt(limit)
    }
  });
});

// Get all activity logs for export
const getAllActivityLogs = asyncHandler(async (req, res) => {
  const { fromDate, toDate } = req.query;
  
  // Build filter object
  const filter = {};
  
  if (fromDate && toDate) {
    filter.date = { $gte: fromDate, $lte: toDate };
  } else if (fromDate) {
    filter.date = { $gte: fromDate };
  } else if (toDate) {
    filter.date = { $lte: toDate };
  }
  
  // Get all logs for export
  const logs = await ActivityLog.find(filter)
    .sort({ date: -1, timeIn: -1 });
  
  res.status(200).json(logs);
});

module.exports = {
  checkIn,
  checkOut,
  transfer,
  getTodayLogs,
  getSeatAvailability,
  getStudentAnalytics,
  getLibraryLeaderboard,
  getOverallAnalysisData,
  getAllActivityLogs,
};
