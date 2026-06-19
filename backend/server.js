require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Event = require('./models/Event');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/causalfunnel_analytics')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// 1. Receive and store events
app.post('/api/events', async (req, res) => {
  try {
    const { session_id, event_type, page_url, timestamp, click_x, click_y } = req.body;
    
    if (!session_id || !event_type || !page_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const event = new Event({
      session_id,
      event_type,
      page_url,
      timestamp: timestamp || new Date(),
      click_x,
      click_y
    });

    await event.save();
    res.status(201).json({ success: true, event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Fetch a list of sessions with event counts
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: '$session_id',
          event_count: { $sum: 1 },
          first_event: { $min: '$timestamp' },
          last_event: { $max: '$timestamp' }
        }
      },
      { $sort: { last_event: -1 } }
    ]);
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Fetch all events for a specific session
app.get('/api/sessions/:session_id/events', async (req, res) => {
  try {
    const events = await Event.find({ session_id: req.params.session_id })
      .sort({ timestamp: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Fetch click data for a page (for heatmap)
app.get('/api/heatmap', async (req, res) => {
  try {
    const { url } = req.query;
    const query = { event_type: 'click' };
    if (url) {
      // Allow partial match or exact match depending on requirement
      query.page_url = { $regex: url, $options: 'i' };
    }
    
    const clicks = await Event.find(query).select('click_x click_y page_url timestamp');
    res.json(clicks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. Get list of unique pages for heatmap dropdown
app.get('/api/pages', async (req, res) => {
  try {
    const pages = await Event.distinct('page_url');
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
