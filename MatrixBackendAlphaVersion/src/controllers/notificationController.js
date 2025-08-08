const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

// Get all notifications for a user (most recent first)
exports.getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', data: { notifications } });
});

// Mark all notifications as read for a user
exports.markAllRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
  res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
});

// Mark a single notification as read
exports.markRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  await Notification.updateOne({ _id: id, user: userId }, { $set: { read: true } });
  res.status(200).json({ status: 'success', message: 'Notification marked as read' });
});

// Create a notification (for system use)
exports.createNotification = asyncHandler(async (req, res) => {
  const { user, message, type, meta } = req.body;
  const notification = await Notification.create({ user, message, type, meta });
  res.status(201).json({ status: 'success', data: { notification } });
}); 