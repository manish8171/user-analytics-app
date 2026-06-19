require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Array Database (Fallback because MongoDB binaries failed on your OS)
let eventsDb = [];
let blockedSessions = new Set();
let endedSessions = new Set();

// 1. Receive and store events
app.post('/api/events', (req, res) => {
  try {
    const { session_id, event_type, page_url, timestamp, click_x, click_y, element_text } = req.body;
    
    if (!session_id || !event_type || !page_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (blockedSessions.has(session_id)) {
      return res.status(403).json({ error: 'Session is blocked' });
    }

    if (endedSessions.has(session_id)) {
      return res.status(403).json({ error: 'Session has ended' });
    }

    const newEvent = {
      _id: Math.random().toString(36).substring(2, 9),
      session_id,
      event_type,
      page_url,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      click_x,
      click_y,
      element_text
    };

    eventsDb.push(newEvent);
    res.status(201).json({ success: true, event: newEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Fetch a list of sessions with event counts
app.get('/api/sessions', (req, res) => {
  try {
    const sessionsMap = {};
    eventsDb.forEach(e => {
      if (!sessionsMap[e.session_id]) {
        sessionsMap[e.session_id] = {
          _id: e.session_id,
          event_count: 0,
          first_event: e.timestamp,
          last_event: e.timestamp
        };
      }
      sessionsMap[e.session_id].event_count++;
      
      const ts = new Date(e.timestamp).getTime();
      const firstTs = new Date(sessionsMap[e.session_id].first_event).getTime();
      const lastTs = new Date(sessionsMap[e.session_id].last_event).getTime();
      
      if (ts < firstTs) sessionsMap[e.session_id].first_event = e.timestamp;
      if (ts > lastTs) sessionsMap[e.session_id].last_event = e.timestamp;
    });

    const sessions = Object.values(sessionsMap).map(s => {
      let status = 'active';
      if (blockedSessions.has(s._id)) status = 'blocked';
      else if (endedSessions.has(s._id)) status = 'ended';
      return { ...s, status };
    }).sort((a, b) => 
      new Date(b.last_event).getTime() - new Date(a.last_event).getTime()
    );
    
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Fetch all events for a specific session
app.get('/api/sessions/:session_id/events', (req, res) => {
  try {
    const sessionEvents = eventsDb
      .filter(e => e.session_id === req.params.session_id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    res.json(sessionEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Fetch click data for a page (for heatmap)
app.get('/api/heatmap', (req, res) => {
  try {
    const { url } = req.query;
    let clicks = eventsDb.filter(e => e.event_type === 'click');
    
    if (url) {
      clicks = clicks.filter(e => e.page_url.toLowerCase().includes(url.toLowerCase()));
    }
    
    res.json(clicks.map(e => ({
      click_x: e.click_x,
      click_y: e.click_y,
      element_text: e.element_text,
      page_url: e.page_url,
      timestamp: e.timestamp
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. Get list of unique pages for heatmap dropdown
app.get('/api/pages', (req, res) => {
  try {
    const pages = [...new Set(eventsDb.map(e => e.page_url))];
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 6. Delete a session
app.delete('/api/sessions/:session_id', (req, res) => {
  try {
    const { session_id } = req.params;
    eventsDb = eventsDb.filter(e => e.session_id !== session_id);
    blockedSessions.delete(session_id);
    endedSessions.delete(session_id);
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 7. Block a session
app.post('/api/sessions/:session_id/block', (req, res) => {
  try {
    blockedSessions.add(req.params.session_id);
    res.json({ success: true, message: 'Session blocked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 8. End a session
app.post('/api/sessions/:session_id/end', (req, res) => {
  try {
    endedSessions.add(req.params.session_id);
    res.json({ success: true, message: 'Session ended' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log('Using Pure JS In-Memory Database to bypass Linux binary constraints!');
});
