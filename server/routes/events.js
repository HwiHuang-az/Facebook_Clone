const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/events
// @desc    Create a new event
router.post('/', auth, upload.single('coverPhoto'), eventController.createEvent);

// @route   GET /api/events
// @desc    Get all events with filters
router.get('/', auth, eventController.getEvents);

// @route   GET /api/events/:id
// @desc    Get single event details
router.get('/:id', auth, eventController.getEventDetails);

// @route   POST /api/events/:id/respond
// @desc    Respond to an event (interested/going)
router.post('/:id/respond', auth, eventController.respondToEvent);

module.exports = router;
