const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all notifications for the logged-in user
router.get('/', notificationController.getUserNotifications);

// Mark all as read
router.patch('/mark-all-read', notificationController.markAllRead);

// Mark a single notification as read
router.patch('/:id/mark-read', notificationController.markRead);

// Create a notification (admin/system use)
router.post('/', notificationController.createNotification);

module.exports = router; 