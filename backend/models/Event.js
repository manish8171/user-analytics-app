const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    index: true
  },
  event_type: {
    type: String,
    enum: ['page_view', 'click'],
    required: true
  },
  page_url: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  click_x: {
    type: Number
  },
  click_y: {
    type: Number
  }
});

module.exports = mongoose.model('Event', EventSchema);
