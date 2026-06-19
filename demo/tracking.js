(function() {
  const BACKEND_URL = 'http://localhost:5000/api/events';
  
  // Get or create session_id
  function getSessionId() {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  const sessionId = getSessionId();

  // Helper to send event
  function sendEvent(eventType, eventData = {}) {
    const payload = {
      session_id: sessionId,
      event_type: eventType,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      ...eventData
    };

    // Use navigator.sendBeacon if available for better reliability when leaving page,
    // otherwise fallback to fetch
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(BACKEND_URL, blob);
    } else {
      fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(err => console.error('Analytics error:', err));
    }
  }

  // Track page_view
  sendEvent('page_view');

  // Track clicks
  document.addEventListener('click', function(e) {
    sendEvent('click', {
      click_x: e.clientX + window.scrollX,
      click_y: e.clientY + window.scrollY
    });
  });
})();
