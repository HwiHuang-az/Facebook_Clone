const { Event, EventResponse, User } = require('../models');
const { Op } = require('sequelize');

// Create a new event
const createEvent = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const { name, description, location, startDate, endDate, privacy } = req.body;
    let coverPhoto = null;

    if (req.file) {
      coverPhoto = req.file.path; // Cloudinary or local path
    }

    const event = await Event.create({
      name,
      description,
      location,
      startDate,
      endDate,
      privacy: privacy || 'public',
      coverPhoto,
      creatorId
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// Get all events with filters
const getEvents = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const now = new Date();

    let whereClause = {};

    if (type === 'upcoming') {
      whereClause.startDate = { [Op.gte]: now };
    } else if (type === 'past') {
      whereClause.startDate = { [Op.lt]: now };
    } else if (type === 'my_events') {
      whereClause.creatorId = req.user.id;
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['startDate', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: events,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

// Get event details
const getEventDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: EventResponse,
          as: 'responses',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture']
            }
          ],
          limit: 10
        }
      ]
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check current user's response
    const myResponse = await EventResponse.findOne({
      where: { eventId: id, userId: req.user.id }
    });

    res.json({
      success: true,
      data: {
        ...event.toJSON(),
        myResponse: myResponse ? myResponse.response : null
      }
    });
  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event details'
    });
  }
};

// Respond to an event
const respondToEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { response } = req.body; // 'going', 'interested', 'not_going'

    if (!['going', 'interested', 'not_going'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid response type'
      });
    }

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find existing response
    const existingResponse = await EventResponse.findOne({
      where: { eventId: id, userId }
    });

    if (existingResponse) {
      const oldResponse = existingResponse.response;
      
      // Update counters if response changed
      if (oldResponse !== response) {
        // Decrement old
        if (oldResponse === 'going') await event.decrement('goingCount');
        if (oldResponse === 'interested') await event.decrement('interestedCount');

        // Increment new
        if (response === 'going') await event.increment('goingCount');
        if (response === 'interested') await event.increment('interestedCount');

        existingResponse.response = response;
        await existingResponse.save();
      }
    } else {
      // Create new response
      await EventResponse.create({
        eventId: id,
        userId,
        response
      });

      // Increment counters
      if (response === 'going') await event.increment('goingCount');
      if (response === 'interested') await event.increment('interestedCount');
    }

    res.json({
      success: true,
      message: `Successfully marked as ${response}`
    });
  } catch (error) {
    console.error('Respond to event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit response'
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventDetails,
  respondToEvent
};
